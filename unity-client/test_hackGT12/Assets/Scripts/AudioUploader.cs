using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using System.IO;

[System.Serializable]
public class AudioResponse
{
    public string contentType;
    public int byteLength;
    public byte[] audioBytes;
}

public class AudioUploader : MonoBehaviour
{
    public string uploadUrl = "https://stunning-reforms-illustrated-gathered.trycloudflare.com/api/stt";
    [SerializeField] private AudioSource audioSource;
    private avatarTalk avatarTalkScript;

    private void Awake()
    {
        uploadUrl = uploadUrl.Trim();
        if (audioSource == null)
        {
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null)
            {
                Debug.LogWarning("AudioUploader: No AudioSource assigned or found on GameObject.");
            }
        }
        
        avatarTalkScript = GetComponent<avatarTalk>();
        if (avatarTalkScript == null)
            Debug.LogWarning("AudioUploader: avatarTalk component missing! Attach it to the same GameObject for talking state management.");
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
        request.certificateHandler = new BypassCertificate(); // trust trycloudflare certs

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Upload successful. Parsing response...");

            // Parse JSON into AudioResponse
            string json = request.downloadHandler.text;
            AudioResponse resp = JsonUtility.FromJson<AudioResponse>(json);

            if (resp != null && resp.audioBytes != null && resp.audioBytes.Length > 0)
            {
                string filePath = Path.Combine(Application.persistentDataPath, "tts_response.mp3");
                File.WriteAllBytes(filePath, resp.audioBytes);
                Debug.Log("Saved audio file to: " + filePath);

                yield return StartCoroutine(PlayFromFile(filePath));
            }
            else
            {
                Debug.LogError("Upload succeeded, but audioBytes were missing or empty.");
            }
        }
        else
        {
            Debug.LogError("Upload failed! Error: " + request.error);
        }
    }

    private IEnumerator PlayFromFile(string path)
    {
        string url = "file://" + path;
        UnityWebRequest www = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.MPEG);
        yield return www.SendWebRequest();

        if (www.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Audio loaded successfully from file.");
            AudioClip clip = DownloadHandlerAudioClip.GetContent(www);
            if (audioSource != null)
            {
                audioSource.clip = clip;
                audioSource.Play();
                Debug.Log("Audio playback started.");
                
                // Notify avatarTalk script that playback has started
                if (avatarTalkScript != null)
                {
                    avatarTalkScript.OnPlaybackStarted();
                }
            }
        }
        else
        {
            Debug.LogError("Failed to load audio from file. Error: " + www.error);
        }
    }
}

public class BypassCertificate : CertificateHandler
{
    protected override bool ValidateCertificate(byte[] certificateData)
    {
        return true;
    }
}
