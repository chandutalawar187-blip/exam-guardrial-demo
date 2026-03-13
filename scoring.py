score_map = {

    "TAB_SWITCH": -10,
    "COPY": -20,
    "PASTE": -20,
    "DEVTOOLS_OPEN": -20,
    "AUTOMATION_DETECTED": -30,
    "LONG_TAB_ABSENCE": -15

}

def get_score_delta(event_type):

    return score_map.get(event_type, 0)