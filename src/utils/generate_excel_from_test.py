import sys

from src.excel_utils import generate_excel_from_test
from src.split_transcription import split_transcription

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python generate_excel_from_test.py <caminho_para_transcricao_test.txt>")
        sys.exit(1)
    test_transcript_path = sys.argv[1]
    generate_excel_from_test(test_transcript_path, split_transcription)
