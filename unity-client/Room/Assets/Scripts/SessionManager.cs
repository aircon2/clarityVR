using UnityEngine;
using TMPro;

public class SessionManager : MonoBehaviour
{
    public TextMeshPro sessionText;
    public AvatarTalk therapistAvatar;

    public void EndSession()
    {
        string formattedText = 
@"Recommendations:

1. Name: Taryn Bush
   Clinic: Greenpoint Psychotherapy
   Rating: 4.8
   Address: 117 Dobbin St Suite 204A, Brooklyn, NY 11222
   Matched Words: stress, anxiety

2. Name: Noah Clyman
   Clinic: Noah Clyman
   Rating: 5
   Address: 225 W 35th St, New York, NY 10001
   Matched Words: stress";

        if (sessionText != null)
        {
            sessionText.text = formattedText;
        }

        // Stop therapist talking if assigned
        if (therapistAvatar != null)
        {
            therapistAvatar.StopTalking();
        }
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.E))
        {
            EndSession();
        }
    }
}

