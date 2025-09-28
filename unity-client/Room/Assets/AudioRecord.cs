using System;
using System.IO;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class RecordAudioXR : MonoBehaviour
{
    [SerializeField] private AudioSource audioSource;
    private AudioClip recordedClip;
    private string device;
    private int sampleRate = 44100;
    private int lengthSec = 3599;
    private bool isRecording = false;

    void Start()
    {
        if (Microphone.devices.Length > 0)
            device = Microphone.devices[0];
        Debug.Log("Recording Audio Script has started.");
    }

    void Update()
    {
        // Push-to-talk with trigger
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

        // Optional: check if recording (log less frequently)
        if (isRecording)
        {
            // You could throttle logs to avoid flooding logcat
        }
    }

    private void StartRecording()
    {
        if (string.IsNullOrEmpty(device) || isRecording) return;

        recordedClip = Microphone.Start(device, false, lengthSec, sampleRate);
        isRecording = true;
        Debug.Log("Recording started...");
    }

    private void StopRecording()
    {
        if (string.IsNullOrEmpty(device) || !isRecording) return;

        Microphone.End(device);
        isRecording = false;
        Debug.Log("Recording stopped.");

        if (recordedClip != null && audioSource != null)
        {
            audioSource.clip = recordedClip;
            audioSource.Play();
            Debug.Log("AudioSource started playing.");
        }
    }

    // --- Handle Quest pausing to avoid 2000ms timeout ---
    private void OnApplicationPause(bool pause)
    {
        if (pause && isRecording)
        {
            // Stop microphone safely if app is pausing
            Debug.Log("App paused, stopping mic to prevent timeout.");
            Microphone.End(device);
            isRecording = false;
        }
    }
}
