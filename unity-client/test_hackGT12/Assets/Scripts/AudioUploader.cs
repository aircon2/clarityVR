using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;

public class AudioUploader : MonoBehaviour
{
    public string uploadUrl = "http://YOUR_SERVER_URL/api/stt";
    public AudioSource audioSource;

    private void Awake()
    {
        uploadUrl = uploadUrl.Trim();
    }

    public void UploadClip(AudioClip clip)
    {
        if (clip == null)
        {
            Debug.LogError("UploadClip: AudioClip is null!");
            return;
        }

        Debug.Log("UploadClip: Starting WAV conversion...");
        byte[] wavData = WavUtility.AudioClipToWav(clip);

        if (wavData == null || wavData.Length == 0)
        {
            Debug.LogError("UploadClip: WAV conversion failed!");
            return;
        }

        Debug.Log("UploadClip: WAV conversion complete, length=" + wavData.Length);
        StartCoroutine(UploadAndPlay(wavData));
    }

    private IEnumerator UploadAndPlay(byte[] wavData)
    {
        Debug.Log("UploadCoroutine: Starting upload, byte length=" + wavData.Length);
        UnityWebRequest request = new UnityWebRequest(uploadUrl, "POST");
        request.uploadHandler = new UploadHandlerRaw(wavData);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "audio/wav");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Upload successful. Parsing response...");
            string responseText = request.downloadHandler.text;

            TTSResponse resp = null;
            try
            {
                resp = JsonUtility.FromJson<TTSResponse>(responseText);
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Error parsing response: " + ex.Message);
            }

            if (resp != null && resp.audioBytes != null && resp.audioBytes.Length > 0)
            {
                string fileExt = resp.contentType.Contains("mpeg") ? "mp3" : "wav";
                string filePath = Path.Combine(Application.persistentDataPath, "tts_response." + fileExt);
                File.WriteAllBytes(filePath, resp.audioBytes);
                Debug.Log("Saved response to: " + filePath);

                yield return StartCoroutine(PlayFromFile(filePath, fileExt));
            }
            else
            {
                Debug.LogError("Response did not contain valid audio bytes.");
            }
        }
        else
        {
            Debug.LogError("Upload failed! Error: " + request.error);
        }
    }

    private IEnumerator PlayFromFile(string path, string fileExt)
    {
        string url = "file://" + path;

        // Decide audio type based on extension
        AudioType type = fileExt == "mp3" ? AudioType.MPEG : AudioType.WAV;

        UnityWebRequest www = UnityWebRequestMultimedia.GetAudioClip(url, type);
        yield return www.SendWebRequest();

        if (www.result == UnityWebRequest.Result.Success)
        {
            AudioClip clip = DownloadHandlerAudioClip.GetContent(www);
            if (clip != null && clip.length > 0f)
            {
                Debug.Log("Audio loaded successfully. Duration: " + clip.length);
                if (audioSource != null)
                {
                    audioSource.Stop();
                    audioSource.clip = clip;
                    audioSource.Play();
                }
                else
                {
                    Debug.LogWarning("AudioSource not assigned!");
                }
            }
            else
            {
                Debug.LogError("Loaded clip is invalid or length is 0.");
            }
        }
        else
        {
            Debug.LogError("Failed to load audio from file. Error: " + www.error);
        }
    }

    [System.Serializable]
    public class TTSResponse
    {
        public string contentType;
        public int byteLength;
        public byte[] audioBytes;
    }
}
