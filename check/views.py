
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser


import fitz  
import re

# Create your views here.


MAIN_HEADING_FONT = "CharisSIL-Bold"
SUB_HEADING_FONT = "CharisSIL-Italic"