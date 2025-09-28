using System;
using System.IO;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

// Now define your classes
public class RecordAudioXR : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    private AudioClip recordedClip;
    private string device;
    private int sampleRate = 44100;
    private int lengthSec = 3599;

    void Start()
    {
        if (Microphone.devices.Length > 0)
            device = Microphone.devices[0];
        Debug.Log("Recording Audio Script has started.");
    }

    void Update()
    {
        if (OVRInput.GetDown(OVRInput.Button.PrimaryIndexTrigger))
        {
            Debug.Log("Trigger pressed, starting recording");
            StartRecording();
        }

        if (OVRInput.GetUp(OVRInput.Button.PrimaryIndexTrigger))
        {
            Debug.Log("Trigger released, stopping recording");
            StopRecording();
        }

        if (Microphone.IsRecording(device))
        {
            Debug.Log("Recording? True");
        }
    }

    private void StartRecording()
    {
        if (string.IsNullOrEmpty(device)) return;
        recordedClip = Microphone.Start(device, false, lengthSec, sampleRate);
        Debug.Log("Recording started...");
    }

    private void StopRecording()
    {
        if (string.IsNullOrEmpty(device)) return;
        Microphone.End(device);
        Debug.Log("Recording stopped.");

        if (recordedClip != null)
        {
            if (audioSource != null)
            {
                audioSource.clip = recordedClip;
                audioSource.Play();
                Debug.Log("AudioSource started playing.");
            }

            // Upload to backend
        //     AudioUploader uploader = GetComponent<AudioUploader>();
        //     if (uploader != null)
        //         uploader.UploadClip(recordedClip);
        }
    }
}

public static class WavUtility
{
    public static byte[] AudioClipToWav(AudioClip clip)
    {
        if (clip == null) return null;

        float[] samples = new float[clip.samples * clip.channels];
        clip.GetData(samples, 0);

        byte[] wavBytes;
        using (var stream = new MemoryStream())
        {
            int sampleCount = samples.Length;
            int headerSize = 44;
            stream.SetLength(headerSize + sampleCount * 2);

            // RIFF header
            System.Text.Encoding.ASCII.GetBytes("RIFF").CopyTo(stream.GetBuffer(), 0);
            BitConverter.GetBytes(stream.Length - 8).CopyTo(stream.GetBuffer(), 4);
            System.Text.Encoding.ASCII.GetBytes("WAVE").CopyTo(stream.GetBuffer(), 8);
            System.Text.Encoding.ASCII.GetBytes("fmt ").CopyTo(stream.GetBuffer(), 12);
            BitConverter.GetBytes(16).CopyTo(stream.GetBuffer(), 16);
            BitConverter.GetBytes((ushort)1).CopyTo(stream.GetBuffer(), 20);
            BitConverter.GetBytes((ushort)clip.channels).CopyTo(stream.GetBuffer(), 22);
            BitConverter.GetBytes(clip.frequency).CopyTo(stream.GetBuffer(), 24);
            BitConverter.GetBytes(clip.frequency * clip.channels * 2).CopyTo(stream.GetBuffer(), 28);
            BitConverter.GetBytes((ushort)(clip.channels * 2)).CopyTo(stream.GetBuffer(), 32);
            BitConverter.GetBytes((ushort)16).CopyTo(stream.GetBuffer(), 34);
            System.Text.Encoding.ASCII.GetBytes("data").CopyTo(stream.GetBuffer(), 36);
            BitConverter.GetBytes(sampleCount * 2).CopyTo(stream.GetBuffer(), 40);

            int offset = 44;
            foreach (var sample in samples)
            {
                short intSample = (short)(Mathf.Clamp(sample, -1f, 1f) * short.MaxValue);
                BitConverter.GetBytes(intSample).CopyTo(stream.GetBuffer(), offset);
                offset += 2;
            }

            wavBytes = stream.ToArray();
        }

        return wavBytes;
    }
}

public class AudioUploader : MonoBehaviour
{
    public void UploadClip(AudioClip clip)
    {
        byte[] wavData = WavUtility.AudioClipToWav(clip);
        StartCoroutine(UploadCoroutine(wavData));
    }

    private IEnumerator UploadCoroutine(byte[] wavData)
    {
        if (wavData == null)
        {
            Debug.LogError("No audio to upload");
            yield break;
        }

        UnityWebRequest request = new UnityWebRequest("https://your-backend.com/upload", "POST");
        request.uploadHandler = new UploadHandlerRaw(wavData);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "audio/wav");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            Debug.Log("Upload successful!");
        else
            Debug.LogError("Upload failed: " + request.error);
    }
}
