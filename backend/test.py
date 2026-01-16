from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
from langchain_tavily import TavilySearch
from langchain_groq import ChatGroq

load_dotenv()


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7,
)
print(llm.invoke("Tell me a joke about computers."))

# llm = ChatGoogleGenerativeAI(
#     model="gemini-3-flash-preview",
#     google_api_key=os.getenv("GEMINI_API_KEY"),
# )

# tavily_search = TavilySearch(
#     max_results=5,
#     search_depth="basic",
# )
# result = tavily_search.invoke({"query": "What is capital of France?"})
# if isinstance(result, (dict, list)):
#     import json
#     print(json.dumps(result, indent=2))
# else:
#     print(str(result))