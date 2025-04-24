// src/routes/+page.js
import { parsePaths } from '$lib/utils/pathUtils';

export async function load({ fetch }) {
    // Load GraphML file
    let graphmlData = null;
    try {
        const graphmlRes = await fetch('/graph-final/path_graph.graphml');
        
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
        const trainRes = await fetch('/paths-final/train_20.txt');
        
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
        const testRes = await fetch('/paths-final/test.txt');
        
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
        const predictedRes = await fetch('/paths-final/pred_test_10000.txt');
        
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