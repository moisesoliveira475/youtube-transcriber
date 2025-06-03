#!/usr/bin/env python3
"""
Exemplo de uso da API Flask do YouTube Transcriber
"""
import requests
import time

# Configuração da API
API_BASE = "http://localhost:5000/api"

def test_health():
    """Testa se a API está rodando"""
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ API está rodando")
            return True
        else:
            print("❌ API não está respondendo")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar à API. Certifique-se de que está rodando.")
        return False

def test_video_info():
    """Testa extração de informações de vídeo"""
    print("\n🔍 Testando extração de informações de vídeo...")
    
    response = requests.post(f"{API_BASE}/video-info", json={
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Video ID extraído: {data.get('video_id')}")
    else:
        print(f"❌ Erro: {response.json()}")

def test_list_files():
    """Testa listagem de arquivos"""
    print("\n📁 Listando arquivos Excel existentes...")
    
    response = requests.get(f"{API_BASE}/files/excel")
    
    if response.status_code == 200:
        data = response.json()
        files = data.get('files', [])
        print(f"✅ Encontrados {len(files)} arquivos Excel:")
        for file in files[:3]:  # Mostra apenas os 3 primeiros
            print(f"   - {file['filename']} ({file['size']} bytes)")
    else:
        print(f"❌ Erro: {response.json()}")

def test_transcription_job():
    """Testa criação de job de transcrição (apenas simulação)"""
    print("\n🎥 Testando criação de job de transcrição...")
    
    # URL de exemplo (pequeno vídeo para teste)
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    response = requests.post(f"{API_BASE}/transcribe", json={
        "urls": [test_url],
        "options": {
            "only_excel": True,  # Só gera Excel, não baixa/transcreve
            "ignore_existing": False
        }
    })
    
    if response.status_code == 202:
        data = response.json()
        job_id = data.get('job_id')
        print(f"✅ Job criado: {job_id}")
        
        # Monitora o job por alguns segundos
        print("⏳ Monitorando progresso...")
        for i in range(5):
            time.sleep(1)
            status_response = requests.get(f"{API_BASE}/jobs/{job_id}/status")
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"   Status: {status_data['status']} - {status_data['current_step']}")
                
                if status_data['status'] in ['completed', 'error']:
                    break
            else:
                print(f"   ❌ Erro ao verificar status: {status_response.json()}")
                break
    else:
        print(f"❌ Erro ao criar job: {response.json()}")

def test_list_jobs():
    """Testa listagem de jobs"""
    print("\n📋 Listando jobs recentes...")
    
    response = requests.get(f"{API_BASE}/jobs?limit=5")
    
    if response.status_code == 200:
        data = response.json()
        jobs = data.get('jobs', [])
        print(f"✅ Encontrados {len(jobs)} jobs:")
        for job in jobs:
            print(f"   - {job['id'][:8]}... | {job['type']} | {job['status']} | {job.get('current_step', 'N/A')}")
    else:
        print(f"❌ Erro: {response.json()}")

def test_analysis_job():
    """Testa criação de job de análise AI"""
    print("\n🤖 Testando criação de job de análise AI...")
    
    # Primeiro, lista arquivos Excel disponíveis
    response = requests.get(f"{API_BASE}/excel-files")
    if response.status_code == 200:
        data = response.json()
        files = data.get('files', [])
        
        if not files:
            print("❌ Nenhum arquivo Excel encontrado para análise")
            return
        
        # Usa o primeiro arquivo encontrado
        excel_file = files[0]['filename']
        print(f"📊 Usando arquivo: {excel_file}")
        
        # Cria job de análise
        analysis_response = requests.post(f"{API_BASE}/analyze", json={
            "excel_file": excel_file,
            "target_person": "Pessoa Teste",
            "with_explanation": False
        })
        
        if analysis_response.status_code == 202:
            analysis_data = analysis_response.json()
            job_id = analysis_data.get('job_id')
            print(f"✅ Job de análise criado: {job_id}")
        else:
            print(f"❌ Erro ao criar job de análise: {analysis_response.json()}")
    else:
        print(f"❌ Erro ao listar arquivos: {response.json()}")

def main():
    """Executa todos os testes"""
    print("🧪 Testando API do YouTube Transcriber\n")
    
    # Testa se API está rodando
    if not test_health():
        return
    
    # Executa testes
    test_video_info()
    test_list_files()
    test_list_jobs()
    test_transcription_job()
    test_analysis_job()
    
    print("\n✅ Testes concluídos!")
    print("\n💡 Para usar a API:")
    print("   1. Inicie a API: python run_api.py")
    print("   2. Faça requests HTTP para os endpoints")
    print("   3. Monitore jobs via GET /api/jobs/{id}/status")

if __name__ == "__main__":
    main()
