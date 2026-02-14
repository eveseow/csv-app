import fs from 'fs';
import csvParser from 'csv-parser';
import { CsvRecord } from '../models/database.js';
import { Op } from 'sequelize';

export class CsvController {
  static async uploadCsv(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const filePath = req.file.path;
      const records = [];

      fs.createReadStream(filePath)
        .pipe(csvParser({
          skipLines: 0,
          mapHeaders: ({ header }) => {
            return header.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim();
          }
        }))
        .on('data', (row) => {
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim();
            const cleanValue = typeof row[key] === 'string' 
              ? row[key].replace(/^["']|["']$/g, '').trim() 
              : row[key];
            cleanedRow[cleanKey] = cleanValue;
          });
          records.push(cleanedRow);
        })
        .on('end', async () => {
          try {
            const csvRecords = records.map((record, index) => {
              const postId = record.postId || record.post_id || record.Id || record['id'];
              const name = record.name || record.Name || record['name'] || '';
              const email = record.email || record.Email || record['email'] || '';
              const body = record.body || record.Body || record['body'] || '';

              console.log(`Record ${index + 1}:`, {
                postId,
                name,
                email,
                bodyLength: body.length
              });

              return {
                post_id: parseInt(postId) || 0,
                name: name.trim(),
                email: email.trim(),
                body: body.trim(),
              };
            });

            await CsvRecord.bulkCreate(csvRecords);

            fs.unlinkSync(filePath);

            res.json({
              message: 'CSV uploaded successfully',
              recordCount: records.length,
            });
          } catch (error) {
            console.error('Error saving records:', error);
            res.status(500).json({ error: 'Error saving records: ' + error.message });
          }
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          res.status(500).json({ error: 'Error parsing CSV file' });
        });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }

  static async getRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const offset = (page - 1) * limit;

      let whereClause = {};

      if (search) {
        whereClause = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { body: { [Op.like]: `%${search}%` } },
          ],
        };
      }

      const { count, rows } = await CsvRecord.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['id', 'ASC']],
      });

      const records = rows.map((record) => ({
        id: record.id,
        post_id: record.post_id,
        name: record.name,
        email: record.email,
        body: record.body,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }));

      res.json({
        records,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching records:', error);
      res.status(500).json({ error: 'Error fetching records' });
    }
  }

  static async getColumns(req, res) {
    try {
      const columns = ['post_id', 'name', 'email', 'body'];
      res.json({ columns });
    } catch (error) {
      console.error('Error fetching columns:', error);
      res.status(500).json({ error: 'Error fetching columns' });
    }
  }

  static async clearRecords(req, res) {
    try {
      await CsvRecord.destroy({ where: {} });
      res.json({ message: 'All records cleared successfully' });
    } catch (error) {
      console.error('Error clearing records:', error);
      res.status(500).json({ error: 'Error clearing records' });
    }
  }
}