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
    
    // Load train file
    let trainPaths = [];
    try {
        const trainRes = await fetch('/train_20.txt');
        
        if (trainRes.ok) {
            const trainText = await trainRes.text();
            trainPaths = parsePaths(trainText);
        } else {
            console.error('Failed to load train file. Status:', trainRes.status);
        }
    } catch (error) {
        console.error('Exception during train file fetch:', error);
    }
    
    return { 
        graphmlData,
        trainPaths
    };
}



// Function to parse the path data
function parsePaths(text) {
    if (!text) return [];
    
    // Split the text into lines and remove any empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Parse each line into a path
    return lines.map(line => {
        // Split the line by spaces
        const tokens = line.split(' ').filter(token => token.trim() !== '');
        
        // Convert all values to integers
        return tokens.map(token => parseInt(token));
    });
}

