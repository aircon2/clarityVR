using UnityEngine;

public class AvatarTalk : MonoBehaviour { private Animator animator; void Awake() { animator = GetComponent<Animator>(); } public void PlayTalking() { animator.SetBool("IsTalking", true); } public void StopTalking() { animator.SetBool("IsTalking", false); } }



