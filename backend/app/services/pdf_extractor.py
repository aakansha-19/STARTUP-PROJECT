import io
import re
from typing import Tuple, Dict, Any

try:
    import pymupdf
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False


class PDFExtractionError(Exception):
    """Raised when PDF extraction fails due to formatting, encryption, or empty content."""
    pass


def extract_text_from_pdf_bytes(pdf_bytes: bytes, filename: str = "uploaded_resume.pdf") -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text and basic document metadata from PDF bytes using PyMuPDF.
    Handles edge cases like encrypted files, zero text (scanned PDFs), and unusual encodings.
    """
    if not PYMUPDF_AVAILABLE:
        raise PDFExtractionError("PyMuPDF engine is not available. Please install PyMuPDF.")

    if not pdf_bytes or len(pdf_bytes) < 32:
        raise PDFExtractionError("The uploaded file is empty or too small to be a valid PDF.")

    # Check magic header '%PDF' anywhere within the first 1024 bytes (per PDF ISO 32000-1 specification)
    if b"%PDF" not in pdf_bytes[:1024]:
        raise PDFExtractionError("Invalid file format. The file does not have a valid PDF header (%PDF).")

    extracted_pages = []
    metadata = {
        "filename": filename,
        "page_count": 0,
        "total_characters": 0,
        "is_encrypted": False,
        "is_scanned_suspicion": False,
    }

    try:
        # Open PDF from in-memory stream without touching disk
        with pymupdf.open(stream=io.BytesIO(pdf_bytes), filetype="pdf") as doc:
            metadata["page_count"] = len(doc)

            if doc.is_encrypted:
                metadata["is_encrypted"] = True
                # Attempt to authenticate with empty password (common for readable encrypted files)
                if not doc.authenticate(""):
                    raise PDFExtractionError("The PDF document is password-protected. Please upload an unlocked PDF.")

            if len(doc) == 0:
                raise PDFExtractionError("The PDF document contains 0 pages.")

            for page_index in range(len(doc)):
                page = doc[page_index]
                text = page.get_text("text")
                # Fallback to block extraction if plain text returns empty
                if not text or not text.strip():
                    try:
                        blocks = page.get_text("blocks")
                        text = "\n".join(b[4] for b in blocks if len(b) > 4 and isinstance(b[4], str))
                    except Exception:
                        pass
                if text and text.strip():
                    extracted_pages.append(text.strip())

    except pymupdf.FileDataError as e:
        raise PDFExtractionError(f"Corrupted or invalid PDF structure: {str(e)}")
    except Exception as e:
        if isinstance(e, PDFExtractionError):
            raise
        raise PDFExtractionError(f"Failed to parse PDF document: {str(e)}")

    full_text = "\n".join(extracted_pages).strip()
    full_text = full_text.replace('\x00', '')

    # Normalize whitespace & unicode artifacts
    cleaned_text = re.sub(r'[\r\f\v]+', '\n', full_text)
    cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    metadata["total_characters"] = len(cleaned_text)

    # Scanned document detection: PDF with pages but negligible text
    if len(cleaned_text) < 40:
        metadata["is_scanned_suspicion"] = True
        raise PDFExtractionError(
            "Could not extract readable text from the uploaded PDF (detected fewer than 40 characters). "
            "The PDF may be an image scan, flattened graphic, or password-protected. "
            "Please upload a standard text-based PDF or switch to the 'Paste Resume Text' tab."
        )

    return cleaned_text, metadata
