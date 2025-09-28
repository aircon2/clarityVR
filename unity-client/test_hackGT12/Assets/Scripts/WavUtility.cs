using System;
using System.IO;
using UnityEngine;

public static class WavUtility
{
    // Convert AudioClip to WAV byte array
    public static byte[] AudioClipToWav(AudioClip clip)
{
    if (clip == null)
    {
        Debug.LogWarning("AudioClipToWav: clip is null!");
        return null;
    }

    Debug.Log("AudioClipToWav: clip samples=" + clip.samples + ", channels=" + clip.channels);

    float[] samples = new float[clip.samples * clip.channels];
    clip.GetData(samples, 0);

    Debug.Log("AudioClipToWav: samples array length=" + samples.Length);

    byte[] wavBytes;
    using (var stream = new MemoryStream())
    {
        int sampleCount = samples.Length;
        int headerSize = 44;
        stream.SetLength(headerSize + sampleCount * 2);

        Debug.Log("AudioClipToWav: stream length=" + stream.Length);

        try
        {
            // Write WAV header
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
            Debug.Log("AudioClipToWav: WAV conversion completed. Byte array length=" + wavBytes.Length);
        }
        catch (Exception ex)
        {
            Debug.LogError("AudioClipToWav exception: " + ex.Message);
            return null;
        }
    }

    return wavBytes;
}


    // Convert WAV byte array to AudioClip
    public static AudioClip WavBytesToAudioClip(byte[] wavBytes, string clipName = "ReceivedClip")
    {
        if (wavBytes == null || wavBytes.Length < 44)
        {
            Debug.LogError("WavBytesToAudioClip: byte array is null or too short!");
            return null;
        }

        int channels = BitConverter.ToInt16(wavBytes, 22);
        int sampleRate = BitConverter.ToInt32(wavBytes, 24);
        int bitsPerSample = BitConverter.ToInt16(wavBytes, 34);

        int dataOffset = 44;
        int sampleCount = (wavBytes.Length - dataOffset) / (bitsPerSample / 8);

        float[] samples = new float[sampleCount];
        int offset = dataOffset;
        for (int i = 0; i < sampleCount; i++)
        {
            short sample = BitConverter.ToInt16(wavBytes, offset);
            samples[i] = sample / 32768f;
            offset += 2;
        }

        AudioClip clip = AudioClip.Create(clipName, sampleCount / channels, channels, sampleRate, false);
        clip.SetData(samples, 0);
        Debug.Log("WavBytesToAudioClip: AudioClip created successfully.");
        return clip;
    }
}
