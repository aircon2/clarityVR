let transcript = [];

function getTranscript() {
  return transcript;
}

function addMessage(role, content) {
  if (!["PATIENT", "THERAPIST"].includes(role)) {
    throw new Error("Role must be 'PATIENT' or 'THERAPIST'");
  }
  transcript.push({ role, content });
}

module.exports = {
  getTranscript,
  addMessage
};