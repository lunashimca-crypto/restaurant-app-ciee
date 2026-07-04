export default function SaveButton({ saved, onToggle }) {
  return (
    <button type="button" className={`action-btn${saved ? " active" : ""}`} onClick={onToggle}>
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}
    </button>
  );
}
