let transcript = [];

function getTranscript() {
    return transcript;
  }

  
function addMessage(role, content) {
  if (!["user", "assistant"].includes(role)) {
    throw new Error("Role must be 'user' or 'assistant'");
  }
  transcript.push({ role, content });
}

module.exports = {
    getTranscript,
    addMessage,
    truncateTranscript
};