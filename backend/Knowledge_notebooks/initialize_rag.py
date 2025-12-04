import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

class VectorRAG:
    model_name = "BAAI/bge-large-en-v1.5"
    model_kwargs = {"device": "cpu"}
    encode_kwargs = {"normalize_embeddings": True}
    embedding_model = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )
    vector_store = {
    "Ophthalmologist":None,
    "Dermatology":None,
    "ENT":None,
    "Gynecology":None,
    "Internal Medicine":None,
    "Orthopedics":None,
    "Pathology":None,
    "Pediatrics":None,
    "Psychiatry":None
    }
    def initialize(self):
        try:
            for i in self.vector_store.keys():
                persist_directory = f"./backend/vector_stores/{i}"
                if os.path.exists(persist_directory):
                    print(f"Loading vector store for {i}...")
                    self.vector_store[i] = Chroma(
                        persist_directory=persist_directory,
                        embedding_function=self.embedding_model
                )
        except Exception as e:
            print(f"Error loading vector store: {e}")
        
        return "✅ Vector store loaded successfully."

def VectorRAG_initialize():
    vector_rag = VectorRAG()
    vector_rag.initialize()
    return vector_rag


