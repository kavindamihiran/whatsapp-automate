# WhatsApp Message Automation

Automatically send WhatsApp messages to multiple Sri Lankan phone numbers.

## Features

- Send messages to multiple numbers automatically
- Supports Sri Lankan phone number formats
- Read numbers from file or enter manually
- Auto-formats phone numbers with +94 country code
- Progress tracking and summary report

## Requirements

- Python 3.7 or higher
- WhatsApp installed on your phone
- Internet connection
- Chrome/Firefox browser

## Installation

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Make sure you're logged into WhatsApp Web in your default browser

## Usage

### Method 1: Using a phone numbers file

1. Add phone numbers to `numbers.txt` (one per line)
2. Run the script:

```bash
python whatsapp_automation.py
```

3. Choose option 1 (from file)
4. Enter your message
5. Confirm to send

### Method 2: Manual entry

1. Run the script:

```bash
python whatsapp_automation.py
```

2. Choose option 2 (manual entry)
3. Enter phone numbers (one per line, press Enter twice when done)
4. Enter your message
5. Confirm to send

## Phone Number Formats

The script automatically handles these formats:

- `0771234567` (Sri Lankan format with leading 0)
- `771234567` (without leading 0)
- `+94771234567` (international format)
- `94771234567` (international without +)

## Important Notes

⚠️ **Before running:**

1. Make sure WhatsApp Web is logged in
2. Close any open WhatsApp Web tabs
3. Don't use your mouse/keyboard while messages are being sent
4. The script will open WhatsApp Web automatically

⚠️ **Limitations:**

- WhatsApp may flag your account if you send too many messages quickly
- Add delays between messages to avoid detection
- Use responsibly and don't spam

⚠️ **First message to new contacts:**

- If the contact doesn't have you saved, they'll see your message in requests
- It's best to send to contacts who already have your number

## Troubleshooting

**Issue: Messages not sending**

- Make sure WhatsApp Web is logged in
- Check your internet connection
- Verify phone numbers are correct

**Issue: Script closes browser too quickly**

- Increase `wait_time` parameter in the code
- Check if pyautogui is working correctly

**Issue: Phone number format errors**

- Make sure numbers are valid Sri Lankan numbers
- Remove spaces and special characters

## Example

```
numbers.txt:
0771234567
0772345678
+94773456789

Message:
Hello! This is an automated message.
Thank you for your support!
```

## License

Free to use for personal purposes. Use responsibly.
