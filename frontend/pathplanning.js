function loadAdjacencyMatrix() {
    fetch('http://localhost:5000/pathplanning')
    .then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch the adjacency matrix.');
        }
    })
    .then(function(data) {
        var adjacencyMatrixContainer = document.getElementById('adjacencyMatrixContainer');
        if (!adjacencyMatrixContainer) {
            throw new Error('adjacencyMatrixContainer not found.');
        }
        
        adjacencyMatrixContainer.innerHTML = '';

        if (!data || !Array.isArray(data)) {
            throw new Error('Adjacency matrix data is missing or invalid.');
        }
        
        // Create grid
        var matrixGrid = document.createElement('div');
        matrixGrid.classList.add('matrix-grid');
        
        // Populate grid with matrix data
        data.forEach(function(row) {
            row.forEach(function(distance) {
                var cellElement = document.createElement('div');
                cellElement.classList.add('matrix-cell');
                cellElement.textContent = distance;
                matrixGrid.appendChild(cellElement);
            });
        });
        
        // Append matrix grid to container
        adjacencyMatrixContainer.appendChild(matrixGrid);
    })
    .catch(function(error) {
        console.error('An error occurred: ', error);
        alert('An error occurred: ' + error.message);
    });
}

function performPathPlanning() {
    window.location.href = 'pathplanning.html';
}
