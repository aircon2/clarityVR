using System.Collections;
using UnityEngine;

public class RecordAudioXR : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    private AudioClip recordedClip;
    private string device;
    private int sampleRate = 44100;
    private int lengthSec = 10;

    private AudioUploader uploader;

    void Start()
    {
        if (Microphone.devices.Length > 0)
        {
            device = Microphone.devices[0];
            Debug.Log("Microphone detected: " + device);
        }
        else
        {
            Debug.LogWarning("No microphone detected!");
        }

        uploader = GetComponent<AudioUploader>();
        if (uploader == null)
            Debug.LogError("AudioUploader component missing! Attach it to the same GameObject.");

        Debug.Log("RecordAudioXR started.");
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

        int position = Microphone.GetPosition(device);
        Microphone.End(device);
        Debug.Log("Recording stopped. Samples captured: " + position);

        if (recordedClip != null && position > 0)
        {
            // Trim to actual length
            float[] samples = new float[recordedClip.channels * position];
            recordedClip.GetData(samples, 0);

            AudioClip trimmedClip = AudioClip.Create(
                "TrimmedClip",
                position,
                recordedClip.channels,
                sampleRate,
                false
            );
            trimmedClip.SetData(samples, 0);

            if (audioSource != null)
            {
                audioSource.clip = trimmedClip;
                audioSource.Play();
                Debug.Log("AudioSource started playing trimmed clip.");
            }

            StartCoroutine(DelayedUploadClip(trimmedClip));
        }
        else
        {
            Debug.LogWarning("Recorded clip is null or had no data. Cannot upload.");
        }
    }

    private IEnumerator DelayedUploadClip(AudioClip clip)
    {
        yield return null; // wait one frame
        if (uploader != null)
        {
            Debug.Log("Starting WAV conversion and upload...");
            uploader.UploadClip(clip);
        }
        else
        {
            Debug.LogError("AudioUploader component missing! Cannot upload.");
        }
    }
}
