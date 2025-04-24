/**
 * Parse path data from text files
 * @param {string} text - Raw text content from path file
 * @param {string} dataType - Type of path data ('train', 'test', 'predicted')
 * @returns {Array} Array of path objects with metadata
 */
export function parsePaths(text, dataType = 'train') {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
        const [pathPart, commentPart] = line.split('  ');
        const tokens = pathPart.split(' ').filter(token => token.trim() !== '');
        const path = tokens.map(token => parseInt(token));
        const pathObj = {
            path: path,
            length: path.length - 3, // Number of internal nodes (excluding start/end)
            start: path[0], // Start node
            end: path[1], // End node
            type: dataType,
            raw: pathPart.trim()
        };

        // Add prediction-specific attributes
        if (dataType === 'predicted') {
            if (commentPart) {
                const comment = commentPart.trim();
                
                if (comment.includes('non-existence path')) {
                    pathObj.correct = false;
                    pathObj.errorType = 'non-existent-edge';
                    
                    // Find the first problematic node in the non-existent edge
                    const match = comment.match(/\('(\d+)', '(\d+)'\)/);
                    if (match) {
                        const errorSource = parseInt(match[1]);
                        const errorTarget = parseInt(match[2]);
                        
                        // Find the index where this edge would occur in the path
                        for (let i = 2; i < path.length - 1; i++) {
                            if (path[i] === errorSource && path[i+1] === errorTarget) {
                                // Calculate actual indices in the core path 
                                const startIdx = i;
                                const endIdx = i + 1;
                                
                                // Store information about the error
                                pathObj.errorStartIndex = startIdx;
                                pathObj.errorStartLabel = errorSource;
                                pathObj.errorEndIndex = endIdx; 
                                pathObj.errorEndLabel = errorTarget;
                                break;
                            }
                        }
                        
                        // If we couldn't find the exact edge, look for the source and target separately
                        if (pathObj.errorStartIndex === undefined) {
                            const sourceIndex = path.indexOf(errorSource);
                            const targetIndex = path.indexOf(errorTarget);
                            
                            if (sourceIndex !== -1 && targetIndex !== -1) {
                                pathObj.errorStartIndex = sourceIndex;
                                pathObj.errorStartLabel = errorSource;
                                pathObj.errorEndIndex = targetIndex;
                                pathObj.errorEndLabel = errorTarget;
                            } else if (sourceIndex !== -1) {
                                // Only found source
                                pathObj.errorStartIndex = sourceIndex;
                                pathObj.errorStartLabel = errorSource;
                                pathObj.errorEndIndex = -1;
                                pathObj.errorEndLabel = errorTarget;
                            } else if (targetIndex !== -1) {
                                // Only found target
                                pathObj.errorStartIndex = -1;
                                pathObj.errorStartLabel = errorSource;
                                pathObj.errorEndIndex = targetIndex;
                                pathObj.errorEndLabel = errorTarget;
                            } else {
                                console.error(`Could not find either node ${errorSource} or ${errorTarget} in path ${path.join(' ')}`);
                                // Set default values to indicate error
                                pathObj.errorStartIndex = -1;
                                pathObj.errorStartLabel = errorSource;
                                pathObj.errorEndIndex = -1;
                                pathObj.errorEndLabel = errorTarget;
                            }
                        }
                    }
                } else if (comment.includes('incorrect start/end')) {
                    pathObj.correct = false;
                    
                    // Check if start is incorrect (third number should equal first number)
                    if (path.length > 2 && path[2] !== path[0]) {
                        pathObj.errorType = 'incorrect-start';
                        pathObj.errorIndex = 2; // Third element in the path
                        pathObj.errorAt = path[2];
                    } 
                    // Check if end is incorrect (second number should equal last number)
                    else if (path.length > 1 && path[1] !== path[path.length - 1]) {
                        pathObj.errorType = 'incorrect-end';
                        pathObj.errorIndex = 1; // Second element in the path
                        pathObj.errorAt = path[1];
                    }
                    // Default fallback if we can't determine specifically
                    else {
                        pathObj.errorType = 'incorrect-endpoints';
                    }
                } else {
                    // Default for predicted paths with comments but no errors
                    pathObj.correct = true;
                    pathObj.errorType = null;
                }
            } else {
                // Default for predicted paths without any comments
                pathObj.correct = true;
                pathObj.errorType = null;
            }
        }

        // if (dataType === 'predicted' && pathObj.correct === false) {
        //     console.log('Complete path object:', JSON.stringify(pathObj, null, 2));
        // }
        
        return pathObj;
    });
}