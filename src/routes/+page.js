// Function to parse train, valid, test files
function parsePaths(text, dataType = 'train') {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {

        const [pathPart, commentPart] = line.split('  ');
        const tokens = pathPart.split(' ').filter(token => token.trim() !== '');
        const path = tokens.map(token => parseInt(token));
        const pathObj = {
            path: path,
            length: path.length - 2, // Number of internal nodes (excluding start/end)
            start: path[0], // Start node
            end: path[path.length - 1], // End node
            type: dataType,
            raw: pathPart.trim()
        };
        
        // Add prediction-specific attributes
        if (dataType === 'predicted' && commentPart) {
            const comment = commentPart.trim();
            
            if (comment.includes('non-existence path')) {
                pathObj.correct = false;
                pathObj.errorType = 'non-existent-path';
                
                // Keep track of the incorrect edge (first point of failure)
                const match = comment.match(/\('(\d+)', '(\d+)'\)/);
                if (match) {
                    pathObj.errorDetail = {
                        from: parseInt(match[1]),
                        to: parseInt(match[2])
                    };
                }
            } else if (comment.includes('incorrect start/end')) {
                pathObj.correct = false;
                pathObj.errorType = 'incorrect-endpoints';
            } else {
                // Default for predicted paths without error comments
                pathObj.correct = true;
                pathObj.errorType = null;
            }
        }
        
        return pathObj;
    });
}

export async function load({ fetch }) {
    // Load GraphML file
    let graphmlData = null;
    try {
        const graphmlRes = await fetch('/graph/path_graph.graphml');
        
        if (graphmlRes.ok) {
            graphmlData = await graphmlRes.text();
        } else {
            console.error('Failed to load GraphML file. Status:', graphmlRes.status);
        }
    } catch (error) {
        console.error('Exception during GraphML file fetch:', error);
    }
    
    // Load train paths
    let trainPaths = [];
    try {
        const trainRes = await fetch('/paths/train_20.txt');
        
        if (trainRes.ok) {
            const trainText = await trainRes.text();
            trainPaths = parsePaths(trainText, 'train');
        } else {
            console.error('Failed to load train file. Status:', trainRes.status);
        }
    } catch (error) {
        console.error('Exception during train file fetch:', error);
    }
    
    // Load test paths
    let testPaths = [];
    try {
        const testRes = await fetch('/paths/test.txt');
        
        if (testRes.ok) {
            const testText = await testRes.text();
            testPaths = parsePaths(testText, 'test');
        } else {
            console.error('Failed to load test file. Status:', testRes.status);
        }
    } catch (error) {
        console.error('Exception during test file fetch:', error);
    }
    
    // Load predicted paths
    let predictedPaths = [];
    try {
        const predictedRes = await fetch('/paths/pred_test_10000.txt');
        
        if (predictedRes.ok) {
            const predictedText = await predictedRes.text();
            predictedPaths = parsePaths(predictedText, 'predicted');
        } else {
            console.error('Failed to load predicted file. Status:', predictedRes.status);
        }
    } catch (error) {
        console.error('Exception during predicted file fetch:', error);
    }
    
    return { 
        graphmlData,
        trainPaths,
        testPaths,
        predictedPaths
    };
}