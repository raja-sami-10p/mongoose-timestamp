/*!
 * Mongoose Timestamps Plugin
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * Original work Copyright(c) 2012 Brian Noguchi
 * MIT Licensed
 */

function timestampsPlugin(schema, options) {
	var updatedAt = 'updatedAt';
	var createdAt = 'createdAt';
	var updatedAtType = Number;
	var createdAtType = Number;

	if (typeof options === 'object') {
		if (typeof options.updatedAt === 'string') {
			updatedAt = options.updatedAt;
		} else if (typeof options.updatedAt === 'object') {
			updatedAt = options.updatedAt.name || updatedAt;
			updatedAtType = options.updatedAt.type || updatedAtType;
		}
		if (typeof options.createdAt === 'string') {
			createdAt = options.createdAt;
		} else if (typeof options.createdAt === 'object') {
			createdAt = options.createdAt.name || createdAt;
			createdAtType = options.createdAt.type || createdAtType;
		}
	}

	var dataObj = {};
	dataObj[updatedAt] = updatedAtType;
	if (schema.path(createdAt)) {
		schema.add(dataObj);
		schema.virtual(createdAt)
			.get( function () {
				if (this["_" + createdAt]) return this["_" + createdAt];
				return this["_" + createdAt] = this._id.getTimestamp();
			});
		schema.pre('save', function (next) {
			if (this.isNew) {
				this[updatedAt] = this[createdAt];
			} else if (this.isModified()) {
				this[updatedAt] = Date.now();
			}
			next();
		});

	} else {
		dataObj[createdAt] = createdAtType;
		schema.add(dataObj);
		schema.pre('save', function (next) {
			if (!this[createdAt]) {
				this[createdAt] = this[updatedAt] = Date.now();
			} else if (this.isModified()) {
				this[updatedAt] = Date.now();
			}
			next();
		});
	}

	schema.pre('findOneAndUpdate', function (next) {
		if (this.op === 'findOneAndUpdate') {
			this._update = this._update || {};
			this._update[updatedAt] = Date.now();
			this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
			this._update['$setOnInsert'][createdAt] = Date.now();
		}
		next();
	});

	schema.pre('update', function(next) {
		if (this.op === 'update') {
			this._update = this._update || {};
			this._update[updatedAt] = Date.now();
			this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
			this._update['$setOnInsert'][createdAt] = Date.now();
		}
		next();
	});

	if(!schema.methods.hasOwnProperty('touch'))
		schema.methods.touch = function(callback){
			this[updatedAt] = Date.now();
			this.save(callback)
		}

}

module.exports = timestampsPlugin;