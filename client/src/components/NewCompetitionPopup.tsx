import { useState } from "react";

function NewCompetitionPopup() {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>;
}

export default NewCompetitionPopup;
