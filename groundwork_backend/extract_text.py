import io
import pypdf
import docx

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
    elif ext == "docx":
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
    elif ext == "txt":
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: .{ext}")

    return text