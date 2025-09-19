document.getElementById('data-analysis-btn').onclick = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      fetch('/data_analysis', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          let result = 'Data Analysis Results:\n';
          result += 'Shape: ' + data.shape + '\n';
          result += 'Columns: ' + data.columns.join(', ') + '\n';
          // Add more as needed
          alert(result);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during data analysis.');
      });
    }
  };
  input.click();
};
