import os
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.vectorstores.utils import filter_complex_metadata

all_slicing_rules = {
    "Ophthalmologist": {
        "81287.pdf": (1, 13),
        "86159.pdf": (1, 13),
        "86632.pdf": (1, 7),
        "87234.pdf": (1, 14),
        "87506.pdf": (1, 4),
        "87575.pdf": (1, 5),
        "1135815.pdf": (1, 12),
        "1170905.pdf": (1, 6),
        "1174603.pdf": (1, 12),
        "1175152.pdf": (1, 25),
        "1188866.pdf": (1, 11),
        "1191342.pdf": (1, 19),
        "1197083.pdf": (1, 6)
    },
    "Dermatology": {
        "69553.pdf": (1, 17),
        "74394.pdf": (1, 7),
        "76331.pdf": (1, 20),
        "76644.pdf": (1, 17),
        "82802.pdf": (1, 9),
        "83589.pdf": (1, 13),
        "84948.pdf": (1, 8),
        "85324.pdf": (1, 10),
        "87306.pdf": (1, 16),
        "1146901.pdf": (1, 18),
        "1158718.pdf": (1, 8)
    },
    "ENT": {
        "62554.pdf": (1, 9),
        "64341.pdf": (1, 13),
        "65465.pdf": (1, 8),
        "65659.pdf": (1, 15),
        "67186.pdf": (1, 6),
        "67805.pdf": (1, 2),
        "68352.pdf": (1, 9),
        "68687.pdf": (1, 9),
        "68735.pdf": (1, 10),
        "69206.pdf": (1, 13),
        "70024.pdf": (1, 9),
        "1133443.pdf": (1, 16),
        "1135636.pdf": (1, 12)    },
    "Gynecology": {
        "87624.pdf": (1, 12),
        "88364.pdf": (1, 16),
        "88657.pdf": (1, 12),
        "88905.pdf": (1, 7),
        "89089.pdf": (1, 16),
        "89369.pdf": (1, 7),
        "1193141.pdf": (1, 7),
        "1197904.pdf": (1, 13),
        "1203553.pdf": (1, 11),
        "1210525.pdf": (1, 4),
        "1215243.pdf": (1, 9),
        "1217644.pdf": (1, 15)
    },
    "Internal Medicine": {
        "11657_2022_Article_1061.pdf": (1, 33),
        "30541.pdf": (1, 18),
        "30544.pdf": (1, 18),
        "31091.pdf": (1, 9),
        "56433.pdf": (1, 14),
        "56549.pdf": (1, 22),
        "56658.pdf": (1, 20),
        "56827.pdf": (1, 9),
        "57506.pdf": (1, 21),
        "68792.pdf": (1, 15),
        "69957.pdf": (1, 14),
        "79759.pdf": (1, 6),
        "81266.pdf": (1, 11),
        "83199.pdf": (1, 10),
        "AnatomyAndPhysiology-LR.pdf": (17, 1309),
        "Microbiology-LR.pdf": (25, 1255)
    },
    "Orthopedics": {
        "26882.pdf": (1, 21),
        "26883.pdf": (1, 14),
        "26884.pdf": (1, 9),
        "83724.pdf": (1, 10),
        "86435.pdf": (1, 6),
        "86516.pdf": (1, 3),
        "86729.pdf": (1, 16),
        "86977.pdf": (1, 10),
        "87640.pdf": (1, 10),
        "88098.pdf": (1, 10),
        "88575.pdf": (1, 13),
        "89058.pdf": (1, 19)
    },
    "Pathology": {
        "34943.pdf": (1, 16),
        "34947.pdf": (1, 14),
        "34951.pdf": (1, 49),
        "56898.pdf": (1, 15),
        "56991.pdf": (1, 18),
        "58213.pdf": (1, 32),
        "59625.pdf": (1, 13),
        "61449.pdf": (1, 6),
        "62764.pdf": (1, 20),
        "69079.pdf": (1, 17),
        "73025.pdf": (1, 14),
        "80562.pdf": (1, 15),
        "82402.pdf": (1, 12)
    },
    "Pediatrics": {
        "64996.pdf": (1, 10),
        "68042.pdf": (1, 18),
        "72507.pdf": (1, 17),
        "74014.pdf": (1, 19),
        "76523.pdf": (1, 9),
        "84848.pdf": (1, 11),
        "86669.pdf": (1, 14),
        "87042.pdf": (1, 8),
        "1185920.pdf": (1, 18),
        "1185974.pdf": (1, 14),
        "1187442.pdf": (1, 15)
    },
    "Psychiatry": {
        "48385.pdf": (1, 19),
        "48400.pdf": (1, 13),
        "48428.pdf": (1, 11),
        "73389.pdf": (1, 7),
        "73881.pdf": (1, 10),
        "83298.pdf": (1, 22),
        "84291.pdf": (1, 13),
        "1162576.pdf": (1, 13),
        "1173787.pdf": (1, 8),
        "1182063.pdf": (1, 22),
        "1183280.pdf": (1, 24),
        "1185325.pdf": (1, 18),
        "1196754.pdf": (1, 12),
        "1198980.pdf": (1, 15),
        "Psychology2e_WEB.pdf": (19, 641)
    }
}

knowledge_base_dir = "../Knowledge Base/"
specialists = list(all_slicing_rules.keys())

model_name = "BAAI/bge-large-en-v1.5"
model_kwargs = {"device": "cpu"}
encode_kwargs = {"normalize_embeddings": True}
embedding_model = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)

for specialist in specialists:
    print(f"--- Processing specialist: {specialist} ---")
    
    pdf_directory = os.path.join(knowledge_base_dir, specialist)
    persist_directory = f"../vector_stores/{specialist}/"
    
    if not os.path.exists(pdf_directory):
        print(f"--- ⚠️ Warning: Directory {pdf_directory} not found, skipping. ---")
        continue

    all_chapter_docs = []
    slicing_rules = all_slicing_rules.get(specialist, {})
    
    pdf_files = [f for f in os.listdir(pdf_directory) if f.endswith('.pdf')]

    for filename in pdf_files:
        file_path = os.path.join(pdf_directory, filename)
        
        if not os.path.exists(file_path):
            print(f"--- ⚠️ Warning: File {filename} not found, skipping. ---")
            continue

        loader = UnstructuredPDFLoader(file_path, mode="paged")
        documents = loader.load()
        
        if filename in slicing_rules:
            start_page, end_page = slicing_rules[filename]
            print(f"--- Processing: {filename}, pages {start_page}-{end_page} ---")
            main_content = [
                doc for doc in documents 
                if start_page <= doc.metadata.get('page_number', 0) <= end_page
            ]
        else:
            print(f"--- Processing: {filename} (all pages) ---")
            main_content = documents
        
        all_chapter_docs.extend(main_content)

    if not all_chapter_docs:
        print(f"--- No documents found for {specialist}, skipping vector store creation. ---")
        continue

    print(f"\n✅ Total documents collected for {specialist}: {len(all_chapter_docs)}")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True 
    )
    chunked_documents = text_splitter.split_documents(all_chapter_docs)
    print(f"Split {len(all_chapter_docs)} documents into {len(chunked_documents)} chunks for {specialist}.")

    filtered_documents = filter_complex_metadata(chunked_documents) 
    
    if not os.path.exists(persist_directory):
        os.makedirs(persist_directory)

    vector_store = Chroma.from_documents(
        documents=filtered_documents,
        embedding=embedding_model,
        persist_directory=persist_directory
    )
    print(f"✅ Vector store for {specialist} created successfully at: {persist_directory}\n")

print("--- All specialists processed. ---")