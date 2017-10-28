exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', (table)=>{
  table.increments();

  table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE').index();

  table.integer('book_id').notNullable().references('id').inTable('books').onDelete('CASCADE').onUpdate('CASCADE').index();
  
  table.timestamps(true, true);

})
};

exports.down = function(knex, Promise) {
return knex.schema.dropTable('favorites')
};
//I changed favorites seed name so that it would run AFTER the other seeds on which it depended for foreign keys.
//https://github.com/tgriesser/knex/issues/637
