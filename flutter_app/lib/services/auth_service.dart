import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Map username to email address
  String _emailFromUsername(String username) {
    return '${username.trim().toLowerCase()}@native-elite.com';
  }

  // Get current user auth state
  Stream<User?> get userStream => _auth.authStateChanges();

  // Login
  Future<UserCredential?> login(String username, String password) async {
    try {
      final email = _emailFromUsername(username);
      final cred = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return cred;
    } on FirebaseAuthException catch (e) {
      debugPrint('AuthService Login Error: ${e.code} - ${e.message}');
      rethrow;
    }
  }

  // Logout
  Future<void> logout() async {
    await _auth.signOut();
  }

  // Create new user (Auth + Firestore document)
  Future<String> createUser({
    required String username,
    required String password,
    required String displayName,
    required String role,
    String? stage,
    String? phone,
    String? bio,
    String? assignedTeacherId,
  }) async {
    try {
      final email = _emailFromUsername(username);
      // Initialize secondary Firebase app in-memory to create user without logging out the admin
      final secondaryApp = await Firebase.initializeApp(
        name: 'SecondaryApp',
        options: Firebase.app().options,
      );

      final secondaryAuth = FirebaseAuth.instanceFor(app: secondaryApp);
      final cred = await secondaryAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final uid = cred.user!.uid;

      // Save user record to Firestore
      await _db.collection('users').doc(uid).set({
        'uid': uid,
        'username': username,
        'displayName': displayName,
        'role': role,
        'stage': stage,
        'avatarUrl': null,
        'phone': phone ?? '',
        'bio': bio ?? '',
        'assignedTeacherId': assignedTeacherId,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Clean up secondary app
      await secondaryApp.delete();
      return uid;
    } on FirebaseAuthException catch (e) {
      debugPrint('AuthService Create User Error: ${e.code} - ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('AuthService Create User Error: $e');
      rethrow;
    }
  }

  // Delete user
  Future<void> deleteUser(String uid) async {
    try {
      await _db.collection('users').doc(uid).delete();
    } catch (e) {
      debugPrint('AuthService Delete User Error: $e');
      rethrow;
    }
  }
}
