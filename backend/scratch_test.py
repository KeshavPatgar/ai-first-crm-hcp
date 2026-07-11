import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.agent import process_chat

try:
    print(process_chat("Based on Dr. Sara's current neutral profile and the local patient trial agreement, generate our formal strategic actions list.", {}))
except Exception as e:
    import traceback
    traceback.print_exc()
