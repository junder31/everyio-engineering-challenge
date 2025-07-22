'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'TODO',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('tasks', ['user_id'], {
      name: 'tasks_user_id_idx',
    });

    await queryInterface.addIndex('tasks', ['status'], {
      name: 'tasks_status_idx',
    });

    await queryInterface.addIndex('tasks', ['user_id', 'status'], {
      name: 'tasks_user_id_status_idx',
    });

    await queryInterface.addIndex('tasks', ['updated_at'], {
      name: 'tasks_updated_at_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  },
};
