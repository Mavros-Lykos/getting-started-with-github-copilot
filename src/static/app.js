document.addEventListener("DOMContentLoaded", async () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Check if elements exist
  if (!activitiesList || !activitySelect) {
    console.error("Required DOM elements not found.");
    return;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      const activities = await response.json();

      // Clear existing content
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities
      for (const [name, details] of Object.entries(activities)) {
        // Create activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Max Participants:</strong> ${details.max_participants}</p>
          <p><strong>Participants:</strong></p>
          <ul style="list-style-type: none;">
            ${details.participants.map(participant => `<li>${participant} <button class='delete-btn' data-participant='${participant}'>❌</button></li>`).join("")}
          </ul>
        `;

        activitiesList.appendChild(card);

        // Add event listener for delete buttons
        card.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', (event) => {
            const participant = event.target.dataset.participant;
            unregisterParticipant(details.id, participant);
          });
        });

        function unregisterParticipant(activityId, participant) {
          fetch(`/activities/${activityId}/participants/${encodeURIComponent(participant)}`, {
            method: 'DELETE'
          })
          .then(response => {
            if (response.ok) {
              event.target.parentElement.remove();
            } else {
              console.error('Failed to unregister participant');
            }
          });
        }
      }
    } catch (error) {
      console.error(error);
      activitiesList.innerHTML = `<p class="error">Failed to load activities. Please try again later.</p>`;
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
