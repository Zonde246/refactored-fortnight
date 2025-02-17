from rest_framework import serializers
from .models import UploadedPDF

class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedPDF
        fields = ['id', 'file', 'uploaded_at']
