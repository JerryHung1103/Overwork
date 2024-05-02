<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      <?php
        // Check the player's outcome
        $playerOutcome = "win"; // Replace with your logic to determine the outcome

        // Set the background image based on the outcome
        if ($playerOutcome == "win") {
          echo "background-image: url('image/WinPage.png');";
        } else {
          echo "background-image: url('image/LosePage.png');";
        }
      ?>
      background-repeat: no-repeat;
      background-size: cover;
      /* You can also adjust other background properties such as position or attachment if needed */
    }
  </style>
</head>
<body>
  <!-- Your HTML content goes here -->
</body>
</html>