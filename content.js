// Immediately load the QA model on startup
(async function() {
    console.log("Loading the question answering model...");
    // Use the global 'transformers' object loaded from transformers.min.js
    const { pipeline } = window.transformers;
    // Load the QA pipeline using a lightweight model
    window.qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    console.log("Model loaded!");
  
    // Listen for mouseup events to detect text selection
    document.addEventListener('mouseup', function(e) {
      let selection = window.getSelection();
      
      // If nothing is selected, hide the bubble
      if (!selection.toString().trim()) {
        removeBubble();
        return;
      }
      
      // Create or update the thought bubble based on the current selection
      createOrUpdateBubble(selection);
    });
  })();
  
  // Create (or update) the floating bubble near the selected text
  function createOrUpdateBubble(selection) {
    let bubble = document.getElementById('myExtensionBubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.id = 'myExtensionBubble';
      bubble.innerHTML = `
        <textarea placeholder="Ask a question..."></textarea>
        <button id="submitQuestion">Ask</button>
        <div id="response"></div>
      `;
      document.body.appendChild(bubble);
      
      // Add a click listener to process the question when button is clicked
      bubble.querySelector('#submitQuestion').addEventListener('click', async function() {
        let question = bubble.querySelector('textarea').value;
        let selectedText = selection.toString();
        await processQuestion(selectedText, question);
      });
    }
    
    // Position the bubble just below the selected text
    let range = selection.getRangeAt(0);
    let rect = range.getBoundingClientRect();
    bubble.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    bubble.style.left = (rect.left + window.scrollX) + 'px';
    bubble.style.display = 'block';
  }
  
  // Hide the bubble if no text is selected
  function removeBubble() {
    let bubble = document.getElementById('myExtensionBubble');
    if (bubble) {
      bubble.style.display = 'none';
    }
  }
  
  // Process the question using the loaded QA model
  async function processQuestion(selectedText, question) {
    let bubble = document.getElementById('myExtensionBubble');
    let responseDiv = bubble.querySelector('#response');
    responseDiv.textContent = "Processing your question...";
  
    try {
      // Call the QA pipeline with the selected text as context
      const result = await window.qaPipeline({
        question: question,
        context: selectedText
      });
      responseDiv.textContent = result.answer;
    } catch (error) {
      console.error("Error processing question:", error);
      responseDiv.textContent = "Error processing your question.";
    }
  }
  