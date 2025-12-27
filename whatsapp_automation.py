import webbrowser
import time
import pyautogui
from urllib.parse import quote

def read_phone_numbers(filename):
    """Read phone numbers from a text file"""
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            numbers = [line.strip() for line in file if line.strip()]
        return numbers
    except FileNotFoundError:
        print(f"Error: {filename} not found!")
        return []

def format_sri_lankan_number(number):
    """Format Sri Lankan phone number to international format"""
    # Remove any spaces, dashes, or special characters
    number = ''.join(filter(str.isdigit, number))
    
    # If number starts with 0, replace with +94
    if number.startswith('0'):
        number = '+94' + number[1:]
    # If number doesn't have country code, add +94
    elif not number.startswith('+94') and not number.startswith('94'):
        number = '+94' + number
    # If number starts with 94 but not +94
    elif number.startswith('94') and not number.startswith('+94'):
        number = '+' + number
    
    return number

def send_whatsapp_message(phone_number, message):
    """Send WhatsApp message to a phone number"""
    try:
        print(f"Sending message to {phone_number}...")
        
        # URL encode the message
        encoded_message = quote(message)
        
        # Create WhatsApp Web URL
        url = f"https://web.whatsapp.com/send?phone={phone_number}&text={encoded_message}"
        
        # Open WhatsApp Web
        webbrowser.open(url)
        
        # Wait for WhatsApp Web to load (adjust based on your internet speed)
        print("Waiting for WhatsApp Web to load...")
        time.sleep(15)
        
        # Press Enter to send
        print("Sending message...")
        pyautogui.press('enter')
        
        print(f"✓ Message sent to {phone_number}")
        
        # Wait before closing and moving to next
        time.sleep(3)
        
        # Close the tab (Ctrl+W)
        pyautogui.hotkey('ctrl', 'w')
        
        # Wait before next message to avoid spam detection
        time.sleep(2)
        
        return True
    except Exception as e:
        print(f"✗ Failed to send message to {phone_number}: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("WhatsApp Message Automation for Sri Lankan Numbers")
    print("=" * 60)
    print()
    
    # Get phone numbers
    print("Choose how to input phone numbers:")
    print("1. From file (numbers.txt)")
    print("2. Enter manually")
    choice = input("Enter choice (1 or 2): ").strip()
    
    phone_numbers = []
    
    if choice == '1':
        filename = input("Enter filename (default: numbers.txt): ").strip()
        if not filename:
            filename = "numbers.txt"
        phone_numbers = read_phone_numbers(filename)
    else:
        print("Enter phone numbers (one per line, press Enter twice when done):")
        while True:
            number = input().strip()
            if not number:
                break
            phone_numbers.append(number)
    
    if not phone_numbers:
        print("No phone numbers provided. Exiting.")
        return
    
    # Format phone numbers
    formatted_numbers = [format_sri_lankan_number(num) for num in phone_numbers]
    
    print(f"\nFound {len(formatted_numbers)} phone numbers:")
    for num in formatted_numbers:
        print(f"  - {num}")
    
    # Get message
    print("\nChoose how to input message:")
    print("1. From file (message.txt)")
    print("2. Enter manually")
    msg_choice = input("Enter choice (1 or 2): ").strip()
    
    message = ""
    
    if msg_choice == '1':
        msg_filename = input("Enter filename (default: message.txt): ").strip()
        if not msg_filename:
            msg_filename = "message.txt"
        try:
            with open(msg_filename, 'r', encoding='utf-8') as f:
                message = f.read().strip()
            print(f"\nMessage loaded from {msg_filename}")
        except FileNotFoundError:
            print(f"Error: {msg_filename} not found!")
            return
    else:
        print("\nEnter your message (press Enter twice when done):")
        message_lines = []
        while True:
            line = input()
            if not line and message_lines:
                break
            message_lines.append(line)
        message = '\n'.join(message_lines)
    
    if not message.strip():
        print("No message provided. Exiting.")
        return
    
    print(f"\nMessage preview:\n{'-' * 40}")
    print(message)
    print(f"{'-' * 40}\n")
    
    # Confirm before sending
    confirm = input("Send messages to all numbers? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("Cancelled.")
        return
    
    print("\n" + "=" * 60)
    print("Starting to send messages...")
    print("=" * 60)
    print("IMPORTANT: Keep WhatsApp Web tab open and don't use your mouse/keyboard")
    print("Waiting 10 seconds for you to prepare...")
    time.sleep(10)
    
    # Send messages
    success_count = 0
    failed_count = 0
    
    for number in formatted_numbers:
        if send_whatsapp_message(number, message):
            success_count += 1
        else:
            failed_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total numbers: {len(formatted_numbers)}")
    print(f"✓ Successfully sent: {success_count}")
    print(f"✗ Failed: {failed_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
