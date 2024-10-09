document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData();
    var fileInput = document.getElementById('fruitImage');
    var fruitType = document.getElementById('fruitType').value;

    formData.append('fruitImage', fileInput.files[0]);
    formData.append('fruitType', fruitType);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        var resultDiv = document.getElementById('result');

        if (data.error) {
            resultDiv.innerHTML = '<p style="color: red;">Error: ' + data.error + '</p>';
        } else {
            resultDiv.innerHTML = `
                <p>Matched Image: ${data.matchedImage}</p>
                <p>Similarity: ${(data.similarity * 100).toFixed(2)}%</p>
                <img src="${data.matchedImage}" alt="Matched Fruit Image">
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = '<p style="color: red;">Failed to upload the image.</p>';
    });
});