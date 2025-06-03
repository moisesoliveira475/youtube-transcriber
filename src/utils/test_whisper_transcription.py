from src.utils.extract_video_id import extract_video_id
from src.generate_transcription import transcribe_audio as whisper_transcribe_audio
from src.generate_transcription_fw import transcribe_audio as fw_transcribe_audio
from src.download_audio import read_urls, download_audio
import os

def test_whisper_transcription(video_id, audio_dir, transcript_dir, force_cpu=False, use_whisper=False):
    urls = read_urls("videos.txt")
    url = None
    for u in urls:
        if extract_video_id(u) == video_id:
            url = u
            break
    if not url:
        print(f"URL não encontrada para o vídeo id: {video_id}")
        return
    audio_file = os.path.join(audio_dir, f"{video_id}_test.wav")
    transcription_file = os.path.join(transcript_dir, f"{video_id}_test.txt")
    segments_file = os.path.join(transcript_dir, f"{video_id}_test.json")
    if not os.path.exists(audio_file):
        print(f"Baixando áudio de teste para {video_id}...")
        if not download_audio(url, audio_file, no_playlist=True):
            print(f"Falha ao baixar áudio de teste para {video_id}")
            return
    print(f"Transcrevendo áudio de teste para {video_id}...")
    if use_whisper:
        whisper_transcribe_audio(audio_file, transcription_file)
    else:
        fw_transcribe_audio(audio_file, transcription_file)
    print(f"Transcrição de teste salva em {transcription_file} e segmentos em {segments_file}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Testa transcrição para um vídeo específico.")
    parser.add_argument("-id", "--video-id", required=True, help="ID do vídeo do YouTube")
    parser.add_argument("-a", "--audios", default="audios", help="Diretório para salvar os áudios baixados")
    parser.add_argument("-t", "--transcripts", default="transcripts", help="Diretório para salvar as transcrições")
    parser.add_argument("--cpu", action="store_true", help="Força o uso de CPU para a transcrição")
    parser.add_argument("--whisper", action="store_true", help="Força o uso do Whisper original (padrão: faster-whisper)")
    args = parser.parse_args()
    test_whisper_transcription(args.video_id, args.audios, args.transcripts, force_cpu=args.cpu, use_whisper=args.whisper)
