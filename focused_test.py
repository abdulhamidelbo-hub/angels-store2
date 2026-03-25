#!/usr/bin/env python3
"""
Focused test for the previously failing endpoints
"""

import requests
import json

BASE_URL = "https://islamic-admin.preview.emergentagent.com/api"

def test_failing_endpoints():
    session = requests.Session()
    
    print("🔍 Testing previously failing endpoints...")
    
    # Test 1: Admin Settings Get
    try:
        response = session.get(f"{BASE_URL}/admin/settings")
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin Settings Get: SUCCESS")
            print(f"   Settings: {list(data.keys())}")
        else:
            print(f"❌ Admin Settings Get: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Admin Settings Get: Exception {str(e)}")
    
    # Test 2: Admin Notifications Auto Settings
    try:
        response = session.get(f"{BASE_URL}/admin/notifications/auto-settings")
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin Notifications Auto Settings: SUCCESS")
            print(f"   Settings: {data}")
        else:
            print(f"❌ Admin Notifications Auto Settings: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Admin Notifications Auto Settings: Exception {str(e)}")
    
    # Test 3: Admin Users Subscription (now that we have a default user)
    try:
        subscription_data = {"action": "grant_year"}
        response = session.put(f"{BASE_URL}/admin/users/default/subscription", json=subscription_data)
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin Users Subscription: SUCCESS")
            print(f"   Response: {data}")
        else:
            print(f"❌ Admin Users Subscription: HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Admin Users Subscription: Exception {str(e)}")

if __name__ == "__main__":
    test_failing_endpoints()