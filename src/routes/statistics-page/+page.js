// src/routes/+page.js - with debugging
import { parsePaths } from '$lib/utils/pathUtils';

export async function load({ fetch }) {
    console.log("Load function started");
    
    // Load GraphML file
    let graphmlData = null;
    try {
        console.log("Attempting to fetch GraphML file");
        const graphmlRes = await fetch('/graph-final/path_graph.graphml');
        
        console.log("GraphML fetch response:", graphmlRes.ok, graphmlRes.status);
        
        if (graphmlRes.ok) {
            graphmlData = await graphmlRes.text();
            console.log("GraphML data length:", graphmlData.length);
        } else {
            console.error('Failed to load GraphML file. Status:', graphmlRes.status);
        }
    } catch (error) {
        console.error('Exception during GraphML file fetch:', error);
    }
    
    // Load train paths
    let trainPaths = [];
    try {
        console.log("Attempting to fetch train_20.txt");
        const trainRes = await fetch('/paths-final/train_20.txt');
        
        console.log("Train fetch response:", trainRes.ok, trainRes.status);
        
        if (trainRes.ok) {
            const trainText = await trainRes.text();
            console.log("Train text length:", trainText.length);
            trainPaths = parsePaths(trainText, 'train');
            console.log("Parsed train paths count:", trainPaths.length);
        } else {
            console.error('Failed to load train file. Status:', trainRes.status);
        }
    } catch (error) {
        console.error('Exception during train file fetch:', error);
    }
    
    // Load test paths
    let testPaths = [];
    try {
        console.log("Attempting to fetch test.txt");
        const testRes = await fetch('/paths-final/test.txt');
        
        console.log("Test fetch response:", testRes.ok, testRes.status);
        
        if (testRes.ok) {
            const testText = await testRes.text();
            console.log("Test text length:", testText.length);
            testPaths = parsePaths(testText, 'test');
            console.log("Parsed test paths count:", testPaths.length);
        } else {
            console.error('Failed to load test file. Status:', testRes.status);
        }
    } catch (error) {
        console.error('Exception during test file fetch:', error);
    }
    
    // Load predicted paths
    let predictedPaths = [];
    try {
        console.log("Attempting to fetch pred_test_10000.txt");
        const predictedRes = await fetch('/paths-final/pred_test_10000.txt');
        
        console.log("Predicted fetch response:", predictedRes.ok, predictedRes.status);
        
        if (predictedRes.ok) {
            const predictedText = await predictedRes.text();
            console.log("Predicted text length:", predictedText.length);
            predictedPaths = parsePaths(predictedText, 'predicted');
            console.log("Parsed predicted paths count:", predictedPaths.length);
        } else {
            console.error('Failed to load predicted file. Status:', predictedRes.status);
        }
    } catch (error) {
        console.error('Exception during predicted file fetch:', error);
    }
    
    // Log final data object before returning
    const returnData = { 
        graphmlData,
        trainPaths,
        testPaths,
        predictedPaths
    };
    
    console.log("Final data being returned:", { 
        graphmlData: Boolean(graphmlData),
        trainPaths: trainPaths.length,
        testPaths: testPaths.length, 
        predictedPaths: predictedPaths.length 
    });
    

    // Print detailed information about the sample paths - debugging info
    // console.log("Sample trainPath:", trainPaths[0]);
    // console.log("trainPath property types:", Object.entries(trainPaths[0] || {}).reduce((types, [key, value]) => {
    //     types[key] = typeof value === 'object' && Array.isArray(value) ? 
    //                 `array(${value.length}) of ${value.length > 0 ? typeof value[0] : 'unknown'}` : 
    //                 typeof value;
    //     return types;
    // }, {}));

    // console.log("Sample testPath:", testPaths[0]);
    // console.log("testPath property types:", Object.entries(testPaths[0] || {}).reduce((types, [key, value]) => {
    //     types[key] = typeof value === 'object' && Array.isArray(value) ? 
    //                 `array(${value.length}) of ${value.length > 0 ? typeof value[0] : 'unknown'}` : 
    //                 typeof value;
    //     return types;
    // }, {}));

    // console.log("Sample predictedPath:", predictedPaths[0]);
    // console.log("predictedPath property types:", Object.entries(predictedPaths[0] || {}).reduce((types, [key, value]) => {
    //     types[key] = typeof value === 'object' && Array.isArray(value) ? 
    //                 `array(${value.length}) of ${value.length > 0 ? typeof value[0] : 'unknown'}` : 
    //                 typeof value;
    //     return types;
    // }, {}));
    
    return returnData;
}