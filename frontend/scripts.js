document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('dustbinForm').addEventListener('submit', function(event) {
    event.preventDefault();
    submitDustbin();
  });

  document.getElementById('calculateRouteButton').addEventListener('click', function() {
    calculateOptimizedRoute();
  });

  loadDustbins();
});

function submitDustbin() {
  var latitude = document.getElementById('latitude').value;
  var longitude = document.getElementById('longitude').value;
  var capacity = document.getElementById('capacity').value;
  
  if (!latitude || !longitude || !capacity) {
    alert('Please fill in all fields.');
    return;
  }
  
  var data = {
    latitude: latitude,
    longitude: longitude,
    capacity: capacity
  };
  
  fetch('http://localhost:5000/create_dustbin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(function(response) {
    if (response.status === 201) {
      alert('Dustbin created successfully!');
      clearFields();
      loadDustbins();
    } else {
      alert('Failed to create dustbin.');
    }
  })
  .catch(function(error) {
    alert('An error occurred: ' + error);
  });
}

function loadDustbins() {
  fetch('http://localhost:5000/dustbins')
  .then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch dustbins.');
    }
  })
  .then(function(data) {
    var dustbinsContainer = document.getElementById('dustbinsContainer');
    dustbinsContainer.innerHTML = '';

    data.dustbins.forEach(function(dustbin) {
      var dustbinElement = document.createElement('div');
      dustbinElement.classList.add('dustbin');
      dustbinElement.innerHTML = `
      <p><strong>ID:</strong> ${dustbin.id}
      <strong>Latitude:</strong> ${dustbin.latitude}
      <strong>Longitude:</strong> ${dustbin.longitude}
      <strong>Capacity:</strong> ${dustbin.capacity}
      <button onclick="modifyDustbin(${dustbin.id})">Modify</button>
      <button onclick="deleteDustbin(${dustbin.id})">Delete</button></p>
  `;
  dustbinsContainer.appendChild(dustbinElement);
  
  // Add markers to the map with labels from the server
  var marker = L.marker([dustbin.latitude, dustbin.longitude]).addTo(map);
  marker.bindPopup('ID: ' + dustbin.id); // Add ID label to the marker
    });
  })
  .catch(function(error) {
    alert('An error occurred: ' + error);
  });
}

function modifyDustbin(id) {
  var latitude = prompt('Enter new latitude:');
  var longitude = prompt('Enter new longitude:');
  var capacity = prompt('Enter new capacity:');
  
  if (latitude !== null && longitude !== null && capacity !== null) {
    var data = {
      latitude: latitude,
      longitude: longitude,
      capacity: capacity
    };
    
    fetch(`http://localhost:5000/update_dustbin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if (response.ok) {
        alert('Dustbin modified successfully!');
        loadDustbins();
      } else {
        throw new Error('Failed to modify dustbin.');
      }
    })
    .catch(function(error) {
      alert('An error occurred: ' + error);
    });
  }
}

function calculateOptimizedRoute() {
  fetch('http://localhost:5000/dustbins')
  .then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch dustbins.');
    }
  })
  .then(function(data) {
    var dustbins = data.dustbins;

    var dustbinsWithCoords = dustbins.filter(function(dustbin) {
      return dustbin.latitude && dustbin.longitude;
    });

    var dustbinsCoords = dustbinsWithCoords.map(function(dustbin) {
      return [parseFloat(dustbin.latitude), parseFloat(dustbin.longitude)];
    });

    var data = {
      dustbins: dustbinsWithCoords
    };

    fetch('http://localhost:5000/plan_optimized_route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to calculate optimized route.');
      }
    })
    .then(function(data) {
      var optimizedRoute = data.optimized_route;
      var optimizedRouteCoords = optimizedRoute.map(function(index) {
        return dustbinsCoords[index];
      });

      var optimizedRouteSequence = optimizedRoute.join(' -> ');
      document.getElementById('optimizedRouteSequence').textContent = optimizedRouteSequence;

      // Draw polyline for optimized route
      var optimizedRoutePolyline = L.polyline(optimizedRouteCoords, {color: 'red'}).addTo(map);
      map.fitBounds(optimizedRoutePolyline.getBounds());
    })
    .catch(function(error) {
      alert('An error occurred: ' + error);
    });
  })
  .catch(function(error) {
    alert('An error occurred: ' + error);
  });
}

function deleteDustbin(id) {
  if (confirm("Are you sure you want to delete this dustbin?")) {
      fetch(`http://localhost:5000/delete_dustbin/${id}`, {
          method: 'DELETE'
      })
      .then(function(response) {
          if (response.ok) {
              alert('Dustbin deleted successfully!');
              loadDustbins(); // Reload dustbins after deletion
          } else {
              throw new Error('Failed to delete dustbin.');
          }
      })
      .catch(function(error) {
          alert('An error occurred: ' + error);
      });
  }
}

function clearFields() {
document.getElementById('latitude').value = '';
document.getElementById('longitude').value = '';
document.getElementById('capacity').value = '';
}

var map = L.map('map').setView([13.04, 80.22], 12);

// Add OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

