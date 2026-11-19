// All definitions, migrations and UI adapters are installed before the first page render.
render();
initializeConceptWorkbench();
CreationWorkflow.syncConcepts(ConceptWorkbench.getState().candidates || []);
