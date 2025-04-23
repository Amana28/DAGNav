import { parsePaths } from '$lib/utils/pathUtils';

export async function load({ fetch }) {
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
        trainPaths,
        testPaths,
        predictedPaths
    };
}