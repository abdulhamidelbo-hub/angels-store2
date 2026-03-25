#!/usr/bin/env python3
"""
Backend API Testing for Adkar Al Muslim Admin Dashboard
Tests all admin endpoints with comprehensive CRUD operations
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend environment
BASE_URL = "https://azkar-app-demo.preview.emergentagent.com/api"

class AdminAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.created_ids = {
            'azkar': [],
            'events': [],
            'challenges': []
        }
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        if response_data:
            result['response'] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_admin_stats(self):
        """Test admin stats endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/admin/stats")
            if response.status_code == 200:
                data = response.json()
                # Check for expected stats structure
                required_fields = ['total_users', 'total_azkar', 'total_events', 'total_challenges']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Admin Stats API", False, f"Missing fields: {missing_fields}", data)
                else:
                    # Verify expected counts from review request
                    azkar_count = data.get('total_azkar', 0)
                    events_count = data.get('total_events', 0)
                    
                    details = f"Users: {data.get('total_users')}, Azkar: {azkar_count}, Events: {events_count}, Challenges: {data.get('total_challenges')}"
                    self.log_test("Admin Stats API", True, details, data)
            else:
                self.log_test("Admin Stats API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Stats API", False, f"Exception: {str(e)}")
    
    def test_admin_charts(self):
        """Test admin charts endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/admin/stats/charts")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['tasbeeh_daily', 'users_monthly']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Admin Charts API", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Admin Charts API", True, "Chart data retrieved successfully")
            else:
                self.log_test("Admin Charts API", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Charts API", False, f"Exception: {str(e)}")
    
    def test_azkar_crud(self):
        """Test Azkar CRUD operations"""
        # Test GET /api/admin/azkar with pagination
        try:
            response = self.session.get(f"{self.base_url}/admin/azkar?page=1&limit=5")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Azkar List", True, f"Retrieved {len(data['items'])} azkar, total: {data['total']}")
                else:
                    self.log_test("Admin Azkar List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Azkar List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Azkar List", False, f"Exception: {str(e)}")
        
        # Test POST /api/admin/azkar (create)
        try:
            azkar_data = {
                "category_id": 1,
                "arabic_text": "اللهم بارك لنا فيما رزقتنا - اختبار",
                "repeat_count": 3
            }
            response = self.session.post(f"{self.base_url}/admin/azkar", json=azkar_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'id' in data:
                    created_id = data['id']
                    self.created_ids['azkar'].append(created_id)
                    self.log_test("Admin Azkar Create", True, f"Created azkar with ID: {created_id}")
                    
                    # Test PUT /api/admin/azkar/{id} (update)
                    update_data = {
                        "arabic_text": "اللهم بارك لنا فيما رزقتنا - محدث",
                        "repeat_count": 5
                    }
                    update_response = self.session.put(f"{self.base_url}/admin/azkar/{created_id}", json=update_data)
                    if update_response.status_code == 200:
                        self.log_test("Admin Azkar Update", True, f"Updated azkar ID: {created_id}")
                    else:
                        self.log_test("Admin Azkar Update", False, f"HTTP {update_response.status_code}: {update_response.text}")
                    
                    # Test DELETE /api/admin/azkar/{id}
                    delete_response = self.session.delete(f"{self.base_url}/admin/azkar/{created_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Azkar Delete", True, f"Deleted azkar ID: {created_id}")
                        self.created_ids['azkar'].remove(created_id)
                    else:
                        self.log_test("Admin Azkar Delete", False, f"HTTP {delete_response.status_code}: {delete_response.text}")
                else:
                    self.log_test("Admin Azkar Create", False, "No success or ID in response")
            else:
                self.log_test("Admin Azkar Create", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Azkar Create", False, f"Exception: {str(e)}")
        
        # Test Export
        try:
            response = self.session.get(f"{self.base_url}/admin/azkar/export")
            if response.status_code == 200:
                data = response.json()
                if 'azkar' in data and 'count' in data:
                    self.log_test("Admin Azkar Export", True, f"Exported {data['count']} azkar")
                else:
                    self.log_test("Admin Azkar Export", False, "Missing azkar or count in response")
            else:
                self.log_test("Admin Azkar Export", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Azkar Export", False, f"Exception: {str(e)}")
        
        # Test Import
        try:
            import_data = {
                "azkar": [{
                    "category_id": 1,
                    "arabic_text": "سبحان الله وبحمده - مستورد",
                    "repeat_count": 1
                }]
            }
            response = self.session.post(f"{self.base_url}/admin/azkar/import", json=import_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Admin Azkar Import", True, f"Imported {data.get('imported', 0)} azkar")
                else:
                    self.log_test("Admin Azkar Import", False, "Import not successful")
            else:
                self.log_test("Admin Azkar Import", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Azkar Import", False, f"Exception: {str(e)}")
    
    def test_events_crud(self):
        """Test Events CRUD operations"""
        # Test GET /api/admin/events
        try:
            response = self.session.get(f"{self.base_url}/admin/events")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Events List", True, f"Retrieved {len(data['items'])} events, total: {data['total']}")
                else:
                    self.log_test("Admin Events List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Events List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Events List", False, f"Exception: {str(e)}")
        
        # Test POST /api/admin/events (create)
        try:
            event_data = {
                "name_ar": "مناسبة اختبار الإدارة",
                "name_en": "Admin Test Event",
                "hijri_month": 1,
                "hijri_day": 15,
                "description_ar": "وصف المناسبة للاختبار",
                "description_en": "Test event description"
            }
            response = self.session.post(f"{self.base_url}/admin/events", json=event_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'id' in data:
                    created_id = data['id']
                    self.created_ids['events'].append(created_id)
                    self.log_test("Admin Events Create", True, f"Created event with ID: {created_id}")
                    
                    # Test PUT /api/admin/events/{id} (update)
                    update_data = {
                        "name_ar": "مناسبة اختبار محدثة",
                        "description_ar": "وصف محدث للمناسبة"
                    }
                    update_response = self.session.put(f"{self.base_url}/admin/events/{created_id}", json=update_data)
                    if update_response.status_code == 200:
                        self.log_test("Admin Events Update", True, f"Updated event ID: {created_id}")
                    else:
                        self.log_test("Admin Events Update", False, f"HTTP {update_response.status_code}: {update_response.text}")
                    
                    # Test DELETE /api/admin/events/{id}
                    delete_response = self.session.delete(f"{self.base_url}/admin/events/{created_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Events Delete", True, f"Deleted event ID: {created_id}")
                        self.created_ids['events'].remove(created_id)
                    else:
                        self.log_test("Admin Events Delete", False, f"HTTP {delete_response.status_code}: {delete_response.text}")
                else:
                    self.log_test("Admin Events Create", False, "No success or ID in response")
            else:
                self.log_test("Admin Events Create", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Events Create", False, f"Exception: {str(e)}")
    
    def test_challenges_crud(self):
        """Test Challenges CRUD operations"""
        # Test GET /api/admin/challenges
        try:
            response = self.session.get(f"{self.base_url}/admin/challenges")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Challenges List", True, f"Retrieved {len(data['items'])} challenges, total: {data['total']}")
                else:
                    self.log_test("Admin Challenges List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Challenges List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Challenges List", False, f"Exception: {str(e)}")
        
        # Test POST /api/admin/challenges (create)
        try:
            challenge_data = {
                "title_ar": "تحدي اختبار الإدارة",
                "title_en": "Admin Test Challenge",
                "description_ar": "وصف التحدي للاختبار",
                "description_en": "Test challenge description",
                "required_count": 50,
                "reward_xp": 25
            }
            response = self.session.post(f"{self.base_url}/admin/challenges", json=challenge_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'id' in data:
                    created_id = data['id']
                    self.created_ids['challenges'].append(created_id)
                    self.log_test("Admin Challenges Create", True, f"Created challenge with ID: {created_id}")
                    
                    # Test PUT /api/admin/challenges/{id} (toggle active)
                    update_data = {"is_active": False}
                    update_response = self.session.put(f"{self.base_url}/admin/challenges/{created_id}", json=update_data)
                    if update_response.status_code == 200:
                        self.log_test("Admin Challenges Update", True, f"Updated challenge ID: {created_id}")
                    else:
                        self.log_test("Admin Challenges Update", False, f"HTTP {update_response.status_code}: {update_response.text}")
                    
                    # Test DELETE /api/admin/challenges/{id}
                    delete_response = self.session.delete(f"{self.base_url}/admin/challenges/{created_id}")
                    if delete_response.status_code == 200:
                        self.log_test("Admin Challenges Delete", True, f"Deleted challenge ID: {created_id}")
                        self.created_ids['challenges'].remove(created_id)
                    else:
                        self.log_test("Admin Challenges Delete", False, f"HTTP {delete_response.status_code}: {delete_response.text}")
                else:
                    self.log_test("Admin Challenges Create", False, "No success or ID in response")
            else:
                self.log_test("Admin Challenges Create", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Challenges Create", False, f"Exception: {str(e)}")
    
    def test_users_management(self):
        """Test Users Management endpoints"""
        # Test GET /api/admin/users
        try:
            response = self.session.get(f"{self.base_url}/admin/users")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Users List", True, f"Retrieved {len(data['items'])} users, total: {data['total']}")
                else:
                    self.log_test("Admin Users List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Users List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Users List", False, f"Exception: {str(e)}")
        
        # Test PUT /api/admin/users/default/subscription
        try:
            subscription_data = {"action": "grant_year"}
            response = self.session.put(f"{self.base_url}/admin/users/default/subscription", json=subscription_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Admin Users Subscription", True, "Granted year subscription to default user")
                else:
                    self.log_test("Admin Users Subscription", False, "Subscription update not successful")
            else:
                self.log_test("Admin Users Subscription", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Users Subscription", False, f"Exception: {str(e)}")
    
    def test_exemptions(self):
        """Test Exemptions endpoints"""
        # Test GET /api/admin/exemptions
        try:
            response = self.session.get(f"{self.base_url}/admin/exemptions")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Exemptions List", True, f"Retrieved {len(data['items'])} exemptions, total: {data['total']}")
                else:
                    self.log_test("Admin Exemptions List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Exemptions List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Exemptions List", False, f"Exception: {str(e)}")
        
        # Test GET /api/admin/exemptions/stats
        try:
            response = self.session.get(f"{self.base_url}/admin/exemptions/stats")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['total', 'approved', 'rejected', 'pending']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Admin Exemptions Stats", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Admin Exemptions Stats", True, f"Total: {data['total']}, Approved: {data['approved']}, Pending: {data['pending']}")
            else:
                self.log_test("Admin Exemptions Stats", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Exemptions Stats", False, f"Exception: {str(e)}")
    
    def test_notifications(self):
        """Test Notifications endpoints"""
        # Test POST /api/admin/notifications/send
        try:
            notification_data = {
                "title_ar": "إشعار اختبار الإدارة",
                "body_ar": "نص الإشعار للاختبار",
                "target": "all"
            }
            response = self.session.post(f"{self.base_url}/admin/notifications/send", json=notification_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Admin Notifications Send", True, "Notification sent successfully")
                else:
                    self.log_test("Admin Notifications Send", False, "Notification send not successful")
            else:
                self.log_test("Admin Notifications Send", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Notifications Send", False, f"Exception: {str(e)}")
        
        # Test GET /api/admin/notifications
        try:
            response = self.session.get(f"{self.base_url}/admin/notifications")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Notifications List", True, f"Retrieved {len(data['items'])} notifications, total: {data['total']}")
                else:
                    self.log_test("Admin Notifications List", False, "Missing items or total in response")
            else:
                self.log_test("Admin Notifications List", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Notifications List", False, f"Exception: {str(e)}")
        
        # Test GET /api/admin/notifications/auto-settings
        try:
            response = self.session.get(f"{self.base_url}/admin/notifications/auto-settings")
            if response.status_code == 200:
                data = response.json()
                self.log_test("Admin Notifications Auto Settings", True, "Retrieved auto notification settings")
            else:
                self.log_test("Admin Notifications Auto Settings", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Notifications Auto Settings", False, f"Exception: {str(e)}")
    
    def test_settings(self):
        """Test Settings endpoints"""
        # Test GET /api/admin/settings
        try:
            response = self.session.get(f"{self.base_url}/admin/settings")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    self.log_test("Admin Settings Get", True, f"Retrieved {len(data)} settings")
                else:
                    self.log_test("Admin Settings Get", False, "Settings response is not a dict")
            else:
                self.log_test("Admin Settings Get", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Settings Get", False, f"Exception: {str(e)}")
        
        # Test PUT /api/admin/settings
        try:
            settings_data = {"subscription_price": 0.75}
            response = self.session.put(f"{self.base_url}/admin/settings", json=settings_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Admin Settings Update", True, "Settings updated successfully")
                else:
                    self.log_test("Admin Settings Update", False, "Settings update not successful")
            else:
                self.log_test("Admin Settings Update", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Settings Update", False, f"Exception: {str(e)}")
    
    def test_backup(self):
        """Test Backup endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/admin/backup")
            if response.status_code == 200:
                data = response.json()
                if 'backup' in data and 'collections' in data:
                    self.log_test("Admin Backup", True, f"Backup exported with {data.get('total_documents', 0)} documents")
                else:
                    self.log_test("Admin Backup", False, "Missing backup or collections in response")
            else:
                self.log_test("Admin Backup", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Backup", False, f"Exception: {str(e)}")
    
    def test_logs(self):
        """Test Logs endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/admin/logs")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Logs", True, f"Retrieved {len(data['items'])} logs, total: {data['total']}")
                else:
                    self.log_test("Admin Logs", False, "Missing items or total in response")
            else:
                self.log_test("Admin Logs", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Logs", False, f"Exception: {str(e)}")
    
    def test_categories(self):
        """Test Categories endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/admin/categories")
            if response.status_code == 200:
                data = response.json()
                if 'items' in data and 'total' in data:
                    self.log_test("Admin Categories", True, f"Retrieved {len(data['items'])} categories, total: {data['total']}")
                else:
                    self.log_test("Admin Categories", False, "Missing items or total in response")
            else:
                self.log_test("Admin Categories", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Admin Categories", False, f"Exception: {str(e)}")
    
    def cleanup_created_resources(self):
        """Clean up any resources created during testing"""
        print("\n🧹 Cleaning up created test resources...")
        
        # Clean up azkar
        for azkar_id in self.created_ids['azkar']:
            try:
                response = self.session.delete(f"{self.base_url}/admin/azkar/{azkar_id}")
                if response.status_code == 200:
                    print(f"✅ Cleaned up azkar ID: {azkar_id}")
                else:
                    print(f"⚠️ Failed to clean up azkar ID: {azkar_id}")
            except Exception as e:
                print(f"⚠️ Error cleaning up azkar ID {azkar_id}: {str(e)}")
        
        # Clean up events
        for event_id in self.created_ids['events']:
            try:
                response = self.session.delete(f"{self.base_url}/admin/events/{event_id}")
                if response.status_code == 200:
                    print(f"✅ Cleaned up event ID: {event_id}")
                else:
                    print(f"⚠️ Failed to clean up event ID: {event_id}")
            except Exception as e:
                print(f"⚠️ Error cleaning up event ID {event_id}: {str(e)}")
        
        # Clean up challenges
        for challenge_id in self.created_ids['challenges']:
            try:
                response = self.session.delete(f"{self.base_url}/admin/challenges/{challenge_id}")
                if response.status_code == 200:
                    print(f"✅ Cleaned up challenge ID: {challenge_id}")
                else:
                    print(f"⚠️ Failed to clean up challenge ID: {challenge_id}")
            except Exception as e:
                print(f"⚠️ Error cleaning up challenge ID {challenge_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run all admin API tests"""
        print("🚀 Starting Admin Dashboard API Tests")
        print(f"📡 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test categories
        self.test_admin_stats()
        self.test_admin_charts()
        self.test_azkar_crud()
        self.test_events_crud()
        self.test_challenges_crud()
        self.test_users_management()
        self.test_exemptions()
        self.test_notifications()
        self.test_settings()
        self.test_backup()
        self.test_logs()
        self.test_categories()
        
        # Clean up
        self.cleanup_created_resources()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        return passed, failed

def main():
    """Main test execution"""
    tester = AdminAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()