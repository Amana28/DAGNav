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