from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes import context_extractor_node, context_optimizer_node, single_generation_node

def build_workflow():
    """
    Constructs the LangGraph state machine.
    Data flows linearly: Extract Context -> Optimize Size -> Generate Output.
    """
    workflow = StateGraph(GraphState)
    
    workflow.add_node("context_extractor", context_extractor_node)
    workflow.add_node("context_optimizer", context_optimizer_node)
    workflow.add_node("single_generation", single_generation_node)
    
    workflow.set_entry_point("context_extractor")
    workflow.add_edge("context_extractor", "context_optimizer")
    workflow.add_edge("context_optimizer", "single_generation")
    workflow.add_edge("single_generation", END)
    
    return workflow.compile()

graph = build_workflow()
