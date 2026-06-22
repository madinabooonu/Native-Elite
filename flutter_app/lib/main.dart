import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'screens/landing_page.dart';
import 'screens/auth_page.dart';
import 'screens/app_layout.dart';
import 'models/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }
  
  runApp(
    ChangeNotifierProvider(
      create: (context) => ThemeProvider(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return MaterialApp(
          title: 'Native Elite',
          debugShowCheckedModeBanner: false,
          themeMode: themeProvider.themeMode,
          theme: ThemeData(
            brightness: Brightness.light,
            scaffoldBackgroundColor: const Color(0xFFF8FAFC),
            primaryColor: const Color(0xFF0353A4),
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0353A4), // brand-blue
              secondary: Color(0xFFEAB308), // brand-yellow
              surface: Colors.white,
            ),
            textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFF0353A4),
              foregroundColor: Colors.white,
              elevation: 0,
            ),
            bottomNavigationBarTheme: const BottomNavigationBarThemeData(
              backgroundColor: Colors.white,
              selectedItemColor: Color(0xFF0353A4),
              unselectedItemColor: Color(0xFF64748B),
              type: BottomNavigationBarType.fixed,
            ),
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            scaffoldBackgroundColor: const Color(0xFF050A24), // brand-navy-deep
            primaryColor: const Color(0xFF0353A4),
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF7BB8F5), // brand-blue-light for dark mode access
              secondary: Color(0xFFEAB308), // brand-yellow
              surface: Color(0xFF0E173C), // brand-navy
            ),
            textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).apply(
              bodyColor: Colors.white,
              displayColor: Colors.white,
            ),
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFF0E173C),
              foregroundColor: Colors.white,
              elevation: 0,
            ),
            bottomNavigationBarTheme: const BottomNavigationBarThemeData(
              backgroundColor: Color(0xFF0E173C),
              selectedItemColor: Color(0xFF7BB8F5),
              unselectedItemColor: Color(0xFF94A3B8),
              type: BottomNavigationBarType.fixed,
            ),
          ),
          initialRoute: '/',
          routes: {
            '/': (context) => const LandingPage(),
            '/auth': (context) => const AuthPage(),
            '/app': (context) => const AppLayout(),
          },
        );
      },
    );
  }
}
