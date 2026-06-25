import 'dart:convert';
import 'package:excel/excel.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart';

class ExportService {
  // ─────────────────────────────────────────────────────────
  // EXCEL EXPORT
  // ─────────────────────────────────────────────────────────
  static Future<void> exportBookingsToExcel(List<Map<String, dynamic>> bookings) async {
    final excel = Excel.createExcel();
    final sheet = excel['Bookings Report'];

    // Headers
    sheet.appendRow([
      TextCellValue('Booking ID'),
      TextCellValue('Student Name'),
      TextCellValue('Teacher Name'),
      TextCellValue('Date'),
      TextCellValue('Time'),
      TextCellValue('Status'),
      TextCellValue('Checked In'),
      TextCellValue('Created At')
    ]);

    // Rows
    for (final b in bookings) {
      sheet.appendRow([
        TextCellValue(b['id']?.toString() ?? ''),
        TextCellValue(b['studentName']?.toString() ?? ''),
        TextCellValue(b['teacherName']?.toString() ?? ''),
        TextCellValue(b['fullDate']?.toString() ?? ''),
        TextCellValue('${b['startTime']} - ${b['endTime']}'),
        TextCellValue(b['status']?.toString() ?? ''),
        TextCellValue(b['checkedIn'] == true ? 'Yes' : 'No'),
        TextCellValue(b['createdAt']?.toString() ?? '')
      ]);
    }

    final bytes = excel.encode();
    if (bytes != null) {
      await _downloadFile(
        bytes: bytes,
        fileName: 'bookings_report.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    }
  }

  static Future<void> exportAttendanceToExcel(List<Map<String, dynamic>> records) async {
    final excel = Excel.createExcel();
    final sheet = excel['Attendance Report'];

    sheet.appendRow([
      TextCellValue('Record ID'),
      TextCellValue('Student Name'),
      TextCellValue('Status'),
      TextCellValue('Note'),
      TextCellValue('Date')
    ]);

    for (final r in records) {
      sheet.appendRow([
        TextCellValue(r['id']?.toString() ?? ''),
        TextCellValue(r['studentName']?.toString() ?? ''),
        TextCellValue(r['status']?.toString() ?? ''),
        TextCellValue(r['note']?.toString() ?? ''),
        TextCellValue(r['date']?.toString() ?? '')
      ]);
    }

    final bytes = excel.encode();
    if (bytes != null) {
      await _downloadFile(
        bytes: bytes,
        fileName: 'attendance_report.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    }
  }

  // ─────────────────────────────────────────────────────────
  // CSV EXPORT
  // ─────────────────────────────────────────────────────────
  static Future<void> exportBookingsToCSV(List<Map<String, dynamic>> bookings) async {
    final buffer = StringBuffer();
    // Headers
    buffer.writeln('Booking ID,Student Name,Teacher Name,Date,Time,Status,Checked In,Created At');

    for (final b in bookings) {
      final id = b['id'] ?? '';
      final sName = b['studentName'] ?? '';
      final tName = b['teacherName'] ?? '';
      final date = b['fullDate'] ?? '';
      final time = '${b['startTime']} - ${b['endTime']}';
      final status = b['status'] ?? '';
      final checked = b['checkedIn'] == true ? 'Yes' : 'No';
      final created = b['createdAt'] ?? '';
      buffer.writeln('"$id","$sName","$tName","$date","$time","$status","$checked","$created"');
    }

    final bytes = utf8.encode(buffer.toString());
    await _downloadFile(
      bytes: bytes,
      fileName: 'bookings_report.csv',
      mimeType: 'text/csv',
    );
  }

  // ─────────────────────────────────────────────────────────
  // PDF EXPORT
  // ─────────────────────────────────────────────────────────
  static Future<void> exportBookingsToPDF(List<Map<String, dynamic>> bookings) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (context) => [
          pw.Header(
            level: 0,
            child: pw.Text('Native Elite - Lesson Bookings Report', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
          ),
          pw.SizedBox(height: 15),
          pw.TableHelper.fromTextArray(
            headers: ['Student', 'Teacher', 'Date', 'Time', 'Status'],
            data: bookings.map((b) => [
              b['studentName']?.toString() ?? '',
              b['teacherName']?.toString() ?? '',
              b['fullDate']?.toString() ?? '',
              '${b['startTime']}-${b['endTime']}',
              b['status']?.toString() ?? ''
            ]).toList(),
            headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
            cellPadding: const pw.EdgeInsets.all(6),
          ),
        ],
      ),
    );

    final bytes = await pdf.save();
    await _downloadFile(
      bytes: bytes,
      fileName: 'bookings_report.pdf',
      mimeType: 'application/pdf',
    );
  }

  // ─────────────────────────────────────────────────────────
  // FILE DOWNLOAD & SHARE UTILITY
  // ─────────────────────────────────────────────────────────
  static Future<void> _downloadFile({
    required List<int> bytes,
    required String fileName,
    required String mimeType,
  }) async {
    try {
      final base64Data = base64Encode(bytes);
      final dataUri = 'data:$mimeType;base64,$base64Data';
      
      // On Web, this triggers download immediately. On Native, it opens share sheet or browser download.
      final uri = Uri.parse(dataUri);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        debugPrint('Could not launch data URI for file download');
      }
    } catch (e) {
      debugPrint('Error downloading file: $e');
    }
  }
}
