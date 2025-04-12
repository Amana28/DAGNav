export async function load({ fetch }) {	
    // Load GraphML file
    let graphmlData = null;
    try {
        const graphmlRes = await fetch('/path_graph.graphml');
        
        if (graphmlRes.ok) {
            graphmlData = await graphmlRes.text();
        } else {
            console.error('Failed to load GraphML file. Status:', graphmlRes.status);
        }
    } catch (error) {
        console.error('Exception during GraphML file fetch:', error);
    }
    
    return { graphmlData };
}