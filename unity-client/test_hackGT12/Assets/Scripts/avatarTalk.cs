using UnityEngine;

public class avatarTalk : MonoBehaviour
{
    [Header("Avatar Talking State")]
    public bool isTalking = false;
    
    private RecordAudioXR recordAudioXR;
    private AudioUploader audioUploader;
    
    void Start()
    {
        // Get references to the other components
        recordAudioXR = GetComponent<RecordAudioXR>();
        audioUploader = GetComponent<AudioUploader>();
        
        if (recordAudioXR == null)
        {
            Debug.LogWarning("avatarTalk: RecordAudioXR component not found on this GameObject!");
        }
        
        if (audioUploader == null)
        {
            Debug.LogWarning("avatarTalk: AudioUploader component not found on this GameObject!");
        }
        
        // Subscribe to events if the components exist
        if (recordAudioXR != null)
        {
            // We'll need to modify RecordAudioXR to call our method
            Debug.Log("avatarTalk: Ready to monitor recording state");
        }
        
        if (audioUploader != null)
        {
            // We'll need to modify AudioUploader to call our method
            Debug.Log("avatarTalk: Ready to monitor playback state");
        }
    }
    
    /// <summary>
    /// Call this method when recording starts to set isTalking to false
    /// </summary>
    public void OnRecordingStarted()
    {
        isTalking = false;
        Debug.Log("avatarTalk: Recording started - isTalking set to false");
    }
    
    /// <summary>
    /// Call this method when audio playback starts to set isTalking to true
    /// </summary>
    public void OnPlaybackStarted()
    {
        isTalking = true;
        Debug.Log("avatarTalk: Playback started - isTalking set to true");
    }
    
    /// <summary>
    /// Call this method when audio playback ends to set isTalking to false
    /// </summary>
    public void OnPlaybackEnded()
    {
        isTalking = false;
        Debug.Log("avatarTalk: Playback ended - isTalking set to false");
    }
    
    void Update()
    {
        // Optional: You can add any additional logic here
        // For example, you might want to automatically set isTalking to false
        // when the audio source stops playing
        if (audioUploader != null)
        {
            AudioSource audioSource = audioUploader.GetComponent<AudioSource>();
            if (audioSource != null && isTalking && !audioSource.isPlaying)
            {
                OnPlaybackEnded();
            }
        }
    }
}
