import StreamerExperience from "../streamer/StreamerExperience";

class AttendeeExperience extends StreamerExperience   {
  constructor(assetsDomain) {
    super(assetsDomain, 'attendee');
  }
}

export default AttendeeExperience;
