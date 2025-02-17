
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import PDFSerializer

import fitz  
import re

EXPECTED_HEADINGS = {
    "Abstract", "Introduction", "Methodology", "Results", 
    "Discussion", "Conclusion", "References"
}

MARGIN_THRESHOLD = 30


outputFile = "debug_output.txt"

MAIN_HEADING_FONT = "CharisSIL-Bold"
SUB_HEADING_FONT = "CharisSIL-Italic"

MAIN_HEADING_PATTERN = r"^\d+\.\s+[A-Za-z]+.*"      
SUB_HEADING_PATTERN = r"^\d+\.\d+\.\s+[A-Za-z]+.*"    
SUB_SUB_HEADING_PATTERN = r"^\d+\.\d+\.\d+\.\s+[A-Za-z]+.*"  


def cleanText(text):
    text = re.sub(r"\s+", " ", text)  
    return text.strip()

def extractAbstractNlp(pdfPath):
    doc = fitz.open(pdfPath)
    fullText = ""
    
    for page in doc[:2]:  
        fullText += page.get_text("text") + "\n"

    abstractMatch = re.search(r"\bA\s*B\s*S\s*T\s*R\s*A\s*C\s*T\b", fullText, re.IGNORECASE)

    if abstractMatch:
        abstractStart = abstractMatch.end()  
        abstractText = fullText[abstractStart:].strip()  
        
        abstractText = re.split(r"\n\s*\d*\.*\s*(INTRODUCTION|1\.)", abstractText, flags=re.IGNORECASE)[0]

        abstractText = cleanText(abstractText)

        wordCount = len(abstractText.split())
        abstractOk = 200 <= wordCount <= 300  

        return {"abstract": abstractText, "wordCount": wordCount, "status": abstractOk}

    return {"abstract": None, "wordCount": 0, "status": False}  


def extractHeadings(filePath):
    mainHeadings = []
    subHeadings = []
    subSubHeadings = []

    doc = fitz.open(filePath)

    for page in doc:
        textData = page.get_text("dict")
        if "blocks" not in textData:
            continue

        for block in textData["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        font = span["font"]

                        if font == MAIN_HEADING_FONT and re.match(MAIN_HEADING_PATTERN, text):
                            mainHeadings.append(text)
                        elif font == SUB_HEADING_FONT and re.match(SUB_HEADING_PATTERN, text):
                            subHeadings.append(text)
                        elif font == SUB_HEADING_FONT and re.match(SUB_SUB_HEADING_PATTERN, text):
                            subSubHeadings.append(text)

    doc.close()
    return {
        "mainHeadings": mainHeadings,
        "subHeadings": subHeadings,
        "subSubHeadings": subSubHeadings
    }

def checkMargins(pdfPath, minMargin=20):
    doc = fitz.open(pdfPath)
    marginsOk = True
    marginDetails = []

    for pageNum, page in enumerate(doc, start=1):
        rect = page.rect
        textRects = [fitz.Rect(span["bbox"]) for block in page.get_text("dict")["blocks"] for line in block.get("lines", []) for span in line.get("spans", [])]

        if not textRects:
            continue

        textBox = fitz.Rect(
            min(r.x0 for r in textRects),
            min(r.y0 for r in textRects),
            max(r.x1 for r in textRects),
            max(r.y1 for r in textRects),
        )

        leftMargin = textBox.x0
        topMargin = textBox.y0
        rightMargin = rect.width - textBox.x1
        bottomMargin = rect.height - textBox.y1

        pageMarginsOk = all(m >= minMargin for m in [leftMargin, topMargin, rightMargin, bottomMargin])
        if not pageMarginsOk:
            marginsOk = False
        
        marginDetails.append({
            "page": pageNum,
            "left": leftMargin,
            "top": topMargin,
            "right": rightMargin,
            "bottom": bottomMargin,
            "status": pageMarginsOk
        })

    doc.close()
    return marginsOk, marginDetails

class PDFUploadView(APIView):
    parserClasses = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        fileSerializer = PDFSerializer(data=request.data)
        if fileSerializer.is_valid():
            pdfInstance = fileSerializer.save()
            filePath = pdfInstance.file.path

            Ack = extractAbstractNlp(filePath)
            headings = extractHeadings(filePath)
            marginsOk, marginDetails = checkMargins(filePath)

            results = {
                "abstract": Ack,
                "headings": headings,
                "margins": {"status": marginsOk, "details": marginDetails},
            }

            return Response(results)
        return Response(fileSerializer.errors, status=400)
